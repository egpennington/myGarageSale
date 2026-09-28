import { useEffect } from 'react';

function PayPalCheckout({ itemId }) {
  console.log('PayPal item ID:', itemId);

  useEffect(() => {
    let paypalButton;
    let handlePayPalClick;
    let cancelled = false;

    async function initializePayPal() {
      try {
        const sdkInstance = await window.paypal.createInstance({
          clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
          components: ['paypal-payments'],
          pageType: 'product-details',
        });

        console.log('PayPal initialized:', Boolean(sdkInstance));

        const paymentMethods = await sdkInstance.findEligibleMethods({
          currencyCode: 'USD',
        });

        console.log('PayPal eligible:', paymentMethods.isEligible('paypal'));

        const paypalSession = sdkInstance.createPayPalOneTimePaymentSession({
          onApprove: async ({ orderId }) => {
            console.log('PayPal approved:', orderId);

            const response = await fetch(
              'http://localhost:9999/.netlify/functions/capture-paypal-order',
              {
                method: 'POST',

                headers: {
                  'Content-Type': 'application/json',
                },

                body: JSON.stringify({
                  orderId,
                }),
              },
            );

            const data = await response.json();

            console.log('Capture endpoint:', data);
          },

          onCancel: () => {
            console.log('PayPal cancelled');
          },

          onError: (error) => {
            console.error('PayPal error:', error);
          },
        });

        paypalButton = document.querySelector('paypal-button');

        handlePayPalClick = async () => {
          try {
            const createOrderPromise = createOrder();

            await paypalSession.start(
              {
                presentationMode: 'auto',
              },
              createOrderPromise,
            );
          } catch (error) {
            console.error('PayPal payment start failed:', error);
          }
        };

        if (cancelled) return;

        paypalButton.addEventListener('click', handlePayPalClick);
      } catch (error) {
        console.error('PayPal initialization failed:', error);
      }
    }

    initializePayPal();

    return () => {
      cancelled = true;

      if (paypalButton && handlePayPalClick) {
        paypalButton.removeEventListener('click', handlePayPalClick);
      }
    };
  }, []);

  async function createOrder() {
    const response = await fetch(
      'http://localhost:9999/.netlify/functions/create-paypal-order',
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          itemId,
        }),
      },
    );

    const data = await response.json();

    console.log('Order created:', data);

    return {
      orderId: data.orderId,
    };
  }

  return <paypal-button type="pay"></paypal-button>;
}

export default PayPalCheckout;
