import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getPayPalAccessToken } from './paypal-utils.mjs';

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

export default async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:5173',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  const body = await request.json();
  const orderId = body.orderId;

  const accessToken = await getPayPalAccessToken();
  const baseUrl = process.env.PAYPAL_BASE_URL;

  const orderResponse = await fetch(
    `${baseUrl}/v2/checkout/orders/${orderId}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    },
  );

  const orderData = await orderResponse.json();
  const orderItemId = orderData.purchase_units?.[0]?.custom_id;

  if (!orderResponse.ok || !orderItemId) {
    return new Response(
      JSON.stringify({
        error: 'Unable to verify PayPal order',
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:5173',
        },
      },
    );
  }

  const preCaptureItemRef = db.collection('items').doc(orderItemId);
  const preCaptureItemDoc = await preCaptureItemRef.get();

  if (!preCaptureItemDoc.exists) {
    return new Response(
      JSON.stringify({
        error: 'Item not found',
      }),
      {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:5173',
        },
      },
    );
  }

  const preCaptureItem = preCaptureItemDoc.data();

  const reservationIsActive =
    preCaptureItem.reservedUntil &&
    preCaptureItem.reservedUntil.toMillis() > Date.now();

  if (!reservationIsActive) {
    await db.runTransaction(async (transaction) => {
      const currentItemDoc = await transaction.get(preCaptureItemRef);

      if (!currentItemDoc.exists) {
        return;
      }

      const currentItem = currentItemDoc.data();

      if (currentItem.paypalOrderId === orderId) {
        transaction.update(preCaptureItemRef, {
          paypalOrderId: null,
          reservationId: null,
          reservedUntil: null,
        });
      }
    });

    return new Response(
      JSON.stringify({
        error: 'PayPal reservation has expired',
      }),
      {
        status: 409,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:5173',
        },
      },
    );
  }

  if (
    preCaptureItem.sold ||
    preCaptureItem.paypalOrderId !== orderId ||
    !preCaptureItem.reservationId
  ) {
    return new Response(
      JSON.stringify({
        error: 'PayPal order no longer owns this item',
      }),
      {
        status: 409,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:5173',
        },
      },
    );
  }

  console.log('PayPal order before capture:', {
    orderId: orderData.id,
    status: orderData.status,
    itemId: orderData.purchase_units?.[0]?.custom_id,
  });

  const captureResponse = await fetch(
    `${baseUrl}/v2/checkout/orders/${orderId}/capture`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    },
  );

  const captureData = await captureResponse.json();

  const purchaseUnit = captureData.purchase_units?.[0];
  const capture = purchaseUnit?.payments?.captures?.[0];

  const itemId = capture?.custom_id;
  const capturedAmount = capture?.amount?.value;
  const capturedCurrency = capture?.amount?.currency_code;
  const captureStatus = capture?.status;

  const itemRef = db.collection('items').doc(itemId);
  const itemDoc = await itemRef.get();

  if (!itemDoc.exists) {
    console.error('Captured item not found:', itemId);

    return new Response(
      JSON.stringify({
        error: 'Item not found',
      }),
      {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:5173',
        },
      },
    );
  }

  const item = itemDoc.data();
  const itemPrice = Number(item.price);
  const paidAmount = Number(capturedAmount);

  const orderOwnsReservation =
    item.paypalOrderId === orderId && item.reservationId;

  const paymentIsValid =
    captureStatus === 'COMPLETED' &&
    capturedCurrency === 'USD' &&
    Number.isFinite(itemPrice) &&
    Number.isFinite(paidAmount) &&
    itemPrice === paidAmount;

  if (!orderOwnsReservation) {
    return new Response(
      JSON.stringify({
        error: 'PayPal order does not own this reservation',
      }),
      {
        status: 409,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:5173',
        },
      },
    );
  }

  if (!paymentIsValid) {
    return new Response(
      JSON.stringify({
        error: 'Payment verification failed',
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:5173',
        },
      },
    );
  }

  // This code can only reach here if paymentIsValid === true

  await db.runTransaction(async (transaction) => {
    const currentItemDoc = await transaction.get(itemRef);

    if (!currentItemDoc.exists) {
      throw new Error('ITEM_NOT_FOUND');
    }

    const currentItem = currentItemDoc.data();

    if (currentItem.sold) {
      throw new Error('ITEM_ALREADY_SOLD');
    }

    if (currentItem.paypalOrderId !== orderId) {
      throw new Error('ORDER_MISMATCH');
    }

    if (!currentItem.reservationId) {
      throw new Error('RESERVATION_MISSING');
    }

    transaction.update(itemRef, {
      sold: true,
      reservationId: null,
      reservedUntil: null,
      paypalOrderId: null,
    });
  });

  console.log('Payment verification:', {
    itemPrice,
    paidAmount,
    capturedCurrency,
    captureStatus,
    paymentIsValid,
  });

  console.log('Matched Firestore item:', {
    itemId,
    title: item.title,
    price: item.price,
  });

  console.log('Verified PayPal capture:', {
    itemId,
    capturedAmount,
    capturedCurrency,
    captureStatus,
  });

  return new Response(
    JSON.stringify({
      orderId,
      captureStatus: captureResponse.status,
      paypalStatus: captureData.status,
      sold: true,
      captureData,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'http://localhost:5173',
      },
    },
  );
};
