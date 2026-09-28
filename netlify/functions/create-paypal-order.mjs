import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import serviceAccount from '../../firebase-service-account.json' with { type: 'json' }
import { getPayPalAccessToken } from './paypal-utils.mjs'

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  })
}

const db = getFirestore()

// item id = 5UBGqA2Te1rVdCvutETY

export default async (request) => {

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:5173',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }

  const body = await request.json()
  const itemId = body.itemId

  const itemRef = db.collection('items').doc(itemId)
  const itemDoc = await itemRef.get()

  if (!itemDoc.exists) {
    return new Response(
      JSON.stringify({
        error: 'Item not found',
      }),
      {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }

  const item = itemDoc.data()
  const price = Number(item.price)

  // Guard it
  if (!Number.isFinite(price) || price <= 0) {
    return new Response(
      JSON.stringify({
        error: 'Invalid item price',
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
  const paypalPrice = price.toFixed(2)

  const accessToken = await getPayPalAccessToken()
  const baseUrl = process.env.PAYPAL_BASE_URL 

  const orderResponse = await fetch(
    `${baseUrl}/v2/checkout/orders`,
    {
      method: 'POST',

      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        intent: 'CAPTURE',

        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: paypalPrice,
            },
          },
        ],
      }),
    }
  )

  const orderData = await orderResponse.json()

  return new Response(
    JSON.stringify({
      itemId,
      itemTitle: item.title,
      itemPrice: item.price,
      orderStatus: orderResponse.status,
      orderId: orderData.id,
      paypalPrice
    }),
    
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'http://localhost:5173',
      },
    }
  )
}