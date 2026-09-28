import { getPayPalAccessToken } from './paypal-utils.mjs';

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
