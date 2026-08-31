import { useEffect, useState } from 'react'

function SellerSettings({ settings, handleUpdateSettings }) {
  const [sellerName, setSellerName] = useState('')
  const [sellerEmail, setSellerEmail] = useState('')
  const [pickupCity, setPickupCity] = useState('')
  const [venmo, setVenmo] = useState('')
  const [paypal, setPaypal] = useState('')
//   const [message, setMessage] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (settings) {
      setSellerName(settings.sellerName || '')
      setSellerEmail(settings.sellerEmail || '')
      setPickupCity(settings.pickupCity || '')
      setVenmo(settings.venmo || '')
      setPaypal(settings.paypal || '')
    }
  }, [settings])

  async function handleSubmit(e) {
    e.preventDefault()

    const updatedSettings = {
      sellerName,
      sellerEmail,
      pickupCity,
      venmo,
      paypal,
    }

    await handleUpdateSettings(updatedSettings)

    setSaved(true)

    setTimeout(() => {
    setSaved(false)
    }, 2000)

    // setMessage('Seller settings saved.')

    // setTimeout(() => {
    //     setMessage('')
    // }, 3000)    
  }

  return (
        <section className="seller-settings">
            <button
            type="button"
            className="settings-toggle"
            onClick={() => setIsOpen((current) => !current)}
            >
            <span>
                <i className="fa-solid fa-gear"></i>
                Seller Settings
            </span>

            <i
                className={`fa-solid ${
                isOpen ? 'fa-chevron-up' : 'fa-chevron-down'
                }`}
            ></i>
            </button>

            {isOpen && (
            <>
                

                <form onSubmit={handleSubmit}>
                <label>
                    Seller Name
                    <input
                    type="text"
                    value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                    />
                </label>

                <label>
                    Seller Email
                    <input
                    type="email"
                    value={sellerEmail}
                    onChange={(e) => setSellerEmail(e.target.value)}
                    />
                </label>

                <label>
                    Pickup City
                    <input
                    type="text"
                    value={pickupCity}
                    onChange={(e) => setPickupCity(e.target.value)}
                    />
                </label>

                <label>
                    Venmo
                    <input
                    type="text"
                    value={venmo}
                    onChange={(e) => setVenmo(e.target.value)}
                    />
                </label>

                <label>
                    PayPal
                    <input
                    type="text"
                    value={paypal}
                    onChange={(e) => setPaypal(e.target.value)}
                    />
                </label>

                <button 
                    type="submit"
                    className={saved ? 'settings-save-button saved' : 'settings-save-button'}>
                    { saved ? 'Saved ✓' : 'Save Seller Settings'}
                </button>
                </form>
            </>
            )}
        </section>
    )
}

export default SellerSettings