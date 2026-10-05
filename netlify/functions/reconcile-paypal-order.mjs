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

  if (!orderId) {
    return new Response(
      JSON.stringify({
        error: 'PayPal order ID is required',
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

  console.log('Reconciling PayPal order:', orderId);

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

  if (!orderResponse.ok) {
    console.error('Unable to retrieve PayPal order:', {
      orderId,
      status: orderResponse.status,
    });

    return new Response(
      JSON.stringify({
        error: 'Unable to retrieve PayPal order',
      }),
      {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:5173',
        },
      },
    );
  }

  console.log('PayPal reconciliation lookup:', {
    orderId: orderData.id,
    status: orderData.status,
  });

  const purchaseUnit = orderData.purchase_units?.[0];
  const capture = purchaseUnit?.payments?.captures?.[0];

  const itemId = purchaseUnit?.custom_id;
  const captureId = capture?.id;
  const capturedAmount = capture?.amount?.value;
  const capturedCurrency = capture?.amount?.currency_code;
  const captureStatus = capture?.status;

  if (!itemId || !captureId || captureStatus !== 'COMPLETED') {
    return new Response(
      JSON.stringify({
        error: 'PayPal order does not contain a completed capture',
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

  console.log('Completed PayPal capture found:', {
    orderId,
    captureId,
    itemId,
    capturedAmount,
    capturedCurrency,
    captureStatus,
  });

  const itemRef = db.collection('items').doc(itemId);
  const itemDoc = await itemRef.get();

  if (!itemDoc.exists) {
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

  const paymentMatchesItem =
    capturedCurrency === 'USD' &&
    Number.isFinite(itemPrice) &&
    Number.isFinite(paidAmount) &&
    itemPrice === paidAmount;

  if (!paymentMatchesItem) {
    console.error('Reconciliation payment mismatch:', {
      itemId,
      itemPrice,
      paidAmount,
      capturedCurrency,
    });

    return new Response(
      JSON.stringify({
        error: 'PayPal payment does not match the item',
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

  console.log('Reconciliation payment verified:', {
    itemId,
    title: item.title,
    itemPrice,
    paidAmount,
    capturedCurrency,
  });

  await db.runTransaction(async (transaction) => {
    const currentItemDoc = await transaction.get(itemRef);

    if (!currentItemDoc.exists) {
      throw new Error('ITEM_NOT_FOUND');
    }

    const currentItem = currentItemDoc.data();

    if (currentItem.sold) {
      return;
    }

    if (currentItem.paypalOrderId !== orderId) {
      throw new Error('ORDER_MISMATCH');
    }

    transaction.update(itemRef, {
      sold: true,
      paypalOrderId: null,
      reservationId: null,
      reservedUntil: null,
    });
  });

  console.log('PayPal reconciliation completed:', {
    orderId,
    captureId,
    itemId,
    sold: true,
  });

  return new Response(
    JSON.stringify({
      reconciled: true,
      orderId,
      captureId,
      itemId,
      sold: true,
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
