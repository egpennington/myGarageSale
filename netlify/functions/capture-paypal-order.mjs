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
  }

  const item = itemDoc.data();
  const itemPrice = Number(item.price);
  const paidAmount = Number(capturedAmount);

  const paymentIsValid =
    captureStatus === 'COMPLETED' &&
    capturedCurrency === 'USD' &&
    Number.isFinite(itemPrice) &&
    Number.isFinite(paidAmount) &&
    itemPrice === paidAmount;

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

  // This Code can only reach here if paymentIsValid === true
  await itemRef.update({
    sold: true,
    reservationId: null,
    reservedUntil: null,
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
