export default async () => {
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

  return new Response(
    JSON.stringify({
      clientIdLoaded: Boolean(clientId),
      clientSecretLoaded: Boolean(clientSecret),
      baseUrlLoaded: Boolean(baseUrl),
      paypalStatus: response.status,
      accessTokenLoaded: Boolean(data.access_token),
    }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
}