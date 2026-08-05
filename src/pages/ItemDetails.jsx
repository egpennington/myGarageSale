import { Link, useParams } from 'react-router-dom'
import { formatCurrency } from '../utils/formatCurrency'

function ItemDetails({ items, itemsLoading }) {
  const { itemId } = useParams()

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

  const sellerName = 'Emmett'
  const sellerEmail = 'egpennington@hotmail.com'

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
        <div className="item-details__image">
          {item.image ? (
            <img src={item.image} alt={item.title} />
          ) : (
            <span>No photo</span>
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