import { Link, useParams } from 'react-router-dom'
import { formatCurrency } from '../utils/formatCurrency'

function ItemDetails({ items }) {
  const { itemId } = useParams()

  const item = items.find((item) => item.id === itemId)

  if (!item) {
    return (
      <section className="item-details">
        <h1>Listing not found</h1>
        <p>This item may have been removed or is still loading.</p>

        <Link to="/store">
          Back to Store
        </Link>
      </section>
    )
  }

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
            <button type="button">
              Contact Seller
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

export default ItemDetails