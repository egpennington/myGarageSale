async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET
  const baseUrl = process.env.PAYPAL_BASE_URL

  const auth = Buffer.from(
    `${clientId}:${clientSecret}`
  ).toString('base64')

  const response = await fetch(
    `${baseUrl}/v1/oauth2/token`,
    {
      method: 'POST',

      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },

      body: 'grant_type=client_credentials',
    }
  )

  const data = await response.json()

  return data.access_token
}

export default async (request) => {
  const body = await request.json()
  const itemId = body.itemId

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
              value: '1.00',
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
      orderStatus: orderResponse.status,
      orderId: orderData.id,
    }),
    
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
}