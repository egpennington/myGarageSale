export async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const baseUrl = process.env.PAYPAL_BASE_URL;

  console.log('PayPal server config:', {
    baseUrl,
    clientIdLoaded: Boolean(clientId),
    clientIdLength: clientId?.length,
    clientIdTail: clientId?.slice(-6),
    clientSecretLoaded: Boolean(clientSecret),
    clientSecretLength: clientSecret?.length,
  });

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('PayPal OAuth failed:', {
      status: response.status,
      error: data.error,
      errorDescription: data.error_description,
    });

    throw new Error('Unable to authenticate with PayPal');
  }

  console.log('PayPal OAuth successful');

  return data.access_token;
}
