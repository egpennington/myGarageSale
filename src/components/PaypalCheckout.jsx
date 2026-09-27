import { useEffect } from 'react'

function PayPalCheckout( {itemId} ) {
  console.log('PayPal item ID:', itemId)

  useEffect(() => {
    async function initializePayPal() {
      try {
        const sdkInstance = await window.paypal.createInstance({
          clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
          components: ['paypal-payments'],
          pageType: 'product-details',
        })

        console.log(
          'PayPal initialized:',
          Boolean(sdkInstance)
        )

        const paymentMethods =
            await sdkInstance.findEligibleMethods({
                currencyCode: 'USD',
            })

            console.log(
                'PayPal eligible:',
                paymentMethods.isEligible('paypal')
                )

      } catch (error) {
        console.error(
          'PayPal initialization failed:',
          error
        )
      }
    }

    initializePayPal()
  }, [])

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
      }
    )

    const data = await response.json()

    console.log('Order created:', data)

    return data.orderId
  }

  return (
    <button
      type="button"
      onClick={createOrder}
    >
      Test PayPal Order
    </button>
  )
}

export default PayPalCheckout