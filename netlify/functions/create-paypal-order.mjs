import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
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
  const itemId = body.itemId;

  const itemRef = db.collection('items').doc(itemId);

  const reservationMinutes = 15;
  const reservationId = crypto.randomUUID();

  const reservedUntil = Timestamp.fromMillis(
    Date.now() + reservationMinutes * 60 * 1000,
  );

  let paypalPrice;

  try {
    await db.runTransaction(async (transaction) => {
      const itemDoc = await transaction.get(itemRef);

      if (!itemDoc.exists) {
        throw new Error('ITEM_NOT_FOUND');
      }

      const item = itemDoc.data();
      const price = Number(item.price);

      if (item.sold) {
        throw new Error('ITEM_SOLD');
      }

      const existingReservation = item.reservedUntil;

      if (existingReservation && existingReservation.toMillis() > Date.now()) {
        throw new Error('ITEM_RESERVED');
      }

      if (!Number.isFinite(price) || price <= 0) {
        throw new Error('INVALID_PRICE');
      }

      paypalPrice = price.toFixed(2);

      transaction.update(itemRef, {
        reservedUntil,
        reservationId,
      });
    });
  } catch (error) {
    if (error.message === 'ITEM_NOT_FOUND') {
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

    if (error.message === 'ITEM_SOLD') {
      return new Response(
        JSON.stringify({
          error: 'Item is already sold',
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

    if (error.message === 'ITEM_RESERVED') {
      return new Response(
        JSON.stringify({
          error: 'Item is temporarily reserved',
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

    if (error.message === 'INVALID_PRICE') {
      return new Response(
        JSON.stringify({
          error: 'Invalid item price',
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

    throw error;
  }

  const accessToken = await getPayPalAccessToken();
  const baseUrl = process.env.PAYPAL_BASE_URL;

  const orderResponse = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: 'POST',

    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({
      intent: 'CAPTURE',

      purchase_units: [
        {
          custom_id: itemId,

          amount: {
            currency_code: 'USD',
            value: paypalPrice,
          },
        },
      ],
    }),
  });

  const orderText = await orderResponse.text();

  let orderData = {};

  if (orderText) {
    try {
      orderData = JSON.parse(orderText);
    } catch {
      orderData = {
        rawResponse: orderText,
      };
    }
  }

  if (!orderResponse.ok) {
    console.error('PayPal order creation failed:', orderData);

    await db.runTransaction(async (transaction) => {
      const itemDoc = await transaction.get(itemRef);

      if (!itemDoc.exists) {
        return;
      }

      const item = itemDoc.data();

      if (item.reservationId === reservationId) {
        transaction.update(itemRef, {
          reservedUntil: null,
          reservationId: null,
        });
      }
    });

    return new Response(
      JSON.stringify({
        error: 'Unable to create PayPal order',
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

  return new Response(
    JSON.stringify({
      itemId,
      orderStatus: orderResponse.status,
      orderId: orderData.id,
      paypalPrice,
      reservationId,
    }),

    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'http://localhost:5173',
      },
    },
  );
};
