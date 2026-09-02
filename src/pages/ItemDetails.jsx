import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { formatCurrency } from '../utils/formatCurrency'

function ItemDetails({ items, itemsLoading, settings }) {
  const { itemId } = useParams()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const item = items.find((item) => item.id === itemId)

  if (itemsLoading) {
    return (
      <section className="item-details">
        <p>Loading listing...</p>
      </section>
    )
  }

  if (!item) {
    return (
      <section className="item-details">
        <h1>Listing not found</h1>
        <p>This item may have been removed.</p>

        <Link to="/store" className="back-link">
          <i className="fa-solid fa-arrow-left"></i> Back to Store
        </Link>
      </section>
    )
  }

  if (!settings) {
    return (
      <section className="item-details">
        <p>Loading seller information...</p>
      </section>
    )
  }

  const images = item.images || []
  const selectedImage = images[selectedImageIndex]

  const sellerName = settings.sellerName
  const sellerEmail = settings.sellerEmail

  const listingUrl =
    `https://mygaragesaleapp.netlify.app/store/${itemId}`

  const emailSubject = encodeURIComponent(
    `Interested in: ${item.title}`
  )

  const emailBody = encodeURIComponent(
`Hi ${sellerName},

I'm interested in your myGarageSale listing for:

${item.title} (${formatCurrency(item.price)})

Listing:
${listingUrl}

Is it still available?

Thank you!`
  )

  const contactLink =
    `mailto:${sellerEmail}?subject=${emailSubject}&body=${emailBody}`

  return (
    <section className="item-details">
      <Link to="/store" className="back-link">
        <i className="fa-solid fa-arrow-left"></i> Back to Store
      </Link>

      <div className="item-details__layout">
        <div className="item-details__gallery">
          <div className="item-details__image">
            {selectedImage ? (
              <img
                src={selectedImage.url}
                alt={item.title}
              />
            ) : (
              <span>No photo</span>
            )}
          </div>

          {images.length > 1 && (
            <div className="item-thumbnails">
              {images.map((image, index) => (
                <button
                  key={image.path || index}
                  type="button"
                  className={
                    selectedImageIndex === index
                      ? 'item-thumbnail active'
                      : 'item-thumbnail'
                  }
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img
                    src={image.url}
                    alt={`${item.title} photo ${index + 1}`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="item-details__content">
          {item.status === 'sold' && (
            <span className="sold-badge">Sold</span>
          )}

          <h1>{item.title}</h1>

          <strong className="item-details__price">
            {formatCurrency(item.price)}
          </strong>

          <p>{item.description}</p>

          {settings.pickupCity && (
            <p className="pickup-location">
              <i className="fa-solid fa-location-dot"></i>
              Pickup in {settings.pickupCity}
            </p>
          )}

          {item.status !== 'sold' && (
            <a
              href={contactLink}
              className="contact-button"
            >
              <i className="fa-solid fa-envelope"></i>
              Contact Seller
            </a>
          )}
        </div>
      </div>
    </section>
  )
}

export default ItemDetails