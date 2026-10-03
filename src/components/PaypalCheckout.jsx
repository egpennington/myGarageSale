import { useEffect, useRef, useState } from 'react';

function PayPalCheckout({ itemId, onItemSold }) {
  console.log('PayPal item ID:', itemId);

  const reservationIdRef = useRef(null);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  const functionsBaseUrl = import.meta.env.DEV ? 'http://localhost:9999' : '';

  useEffect(() => {
    let paypalButton;
    let handlePayPalClick;
    let cancelled = false;

    async function initializePayPal() {
      const sessionId = crypto.randomUUID();

      console.log('Initializing PayPal session:', sessionId);

      try {
        const sdkInstance = await window.paypal.createInstance({
          clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
          components: ['paypal-payments'],
          pageType: 'product-details',
        });

        console.log('PayPal initialized:', sessionId, Boolean(sdkInstance));

        const paymentMethods = await sdkInstance.findEligibleMethods({
          currencyCode: 'USD',
        });

        console.log('PayPal eligible:', paymentMethods.isEligible('paypal'));

        const paypalSession = sdkInstance.createPayPalOneTimePaymentSession({
          onApprove: async ({ orderId }) => {
            console.log('PayPal approved:', orderId);

            const response = await fetch(
              `${functionsBaseUrl}/.netlify/functions/capture-paypal-order`,
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

            if (!response.ok) {
              if (
                response.status === 409 &&
                data.error?.includes('reservation has expired')
              ) {
                setCheckoutError(
                  'Your checkout session expired. Please click PayPal to try again.',
                );
              } else {
                setCheckoutError(
                  'Your payment could not be completed. Please try again.',
                );
              }

              return;
            }

            if (data.paypalStatus === 'COMPLETED' && data.sold) {
              setCheckoutError('');
              setPaymentComplete(true);
              onItemSold(itemId);
            }
          },

          onCancel: async ({ orderId }) => {
            console.log('PayPal cancelled:', sessionId);

            console.log('Reservation at cancel:', reservationIdRef.current);

            const reservationId = reservationIdRef.current;

            if (!reservationId) {
              return;
            }

            try {
              const response = await fetch(
                `${functionsBaseUrl}/.netlify/functions/release-paypal-reservation`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    itemId,
                    reservationId,
                  }),
                },
              );

              const data = await response.json();

              console.log('Reservation release:', data);

              if (data.released) {
                reservationIdRef.current = null;
              }
            } catch (error) {
              console.error('Reservation release failed:', error);
            }
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
    setCheckoutError('');

    const response = await fetch(
      `${functionsBaseUrl}/.netlify/functions/create-paypal-order`,
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

    if (!response.ok) {
      if (
        response.status === 409 &&
        data.error?.includes('temporarily reserved')
      ) {
        setCheckoutError(
          'Someone is currently checking out with this item. Try again in a few minutes.',
        );
      } else if (
        response.status === 409 &&
        data.error?.includes('already sold')
      ) {
        setCheckoutError('Sorry, this item has already been sold.');
      } else {
        setCheckoutError('Checkout could not be started. Please try again.');
      }

      throw new Error(data.error || 'Could not create PayPal order');
    }

    reservationIdRef.current = data.reservationId;

    console.log('Order created:', data);

    return { orderId: data.orderId };
  }

  if (paymentComplete) {
    return (
      <div className="payment-success">
        <strong>Payment complete!</strong>
        <p>This item is now sold. Thank you for your purchase.</p>
      </div>
    );
  }

  return (
    <>
      <paypal-button type="pay"></paypal-button>

      {checkoutError && (
        <div className="checkout-error">
          <strong>Checkout problem</strong>
          <p>{checkoutError}</p>
        </div>
      )}
    </>
  );
}

export default PayPalCheckout;
