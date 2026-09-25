import { useEffect } from 'react'

function PayPalCheckout() {
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

  return null
}

export default PayPalCheckout