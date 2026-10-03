import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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
  const { itemId, reservationId } = body;

  const itemRef = db.collection('items').doc(itemId);

  let released = false;

  await db.runTransaction(async (transaction) => {
    const itemDoc = await transaction.get(itemRef);

    if (!itemDoc.exists) {
      return;
    }

    const item = itemDoc.data();

    if (item.reservationId !== reservationId) {
      return;
    }

    transaction.update(itemRef, {
      reservedUntil: null,
      reservationId: null,
      paypalOrderId: null,
    });

    released = true;
  });

  return new Response(
    JSON.stringify({
      released,
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
