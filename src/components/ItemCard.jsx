import { formatCurrency } from '../utils/formatCurrency'

function ItemCard({ item }) {
  return (
    <article className="item-card">
      <div className="item-card__image">
        {item.image ? (
          <img src={item.image} alt={item.title} />
        ) : (
          <span>No photo</span>
        )}
      </div>

      <div className="item-card__body">
        <h2>{item.title}</h2>
        <p>{item.description}</p>
        <strong>{formatCurrency(item.price)}</strong>

        {item.status === 'sold' && <span className="sold-badge">Sold</span>}
      </div>
    </article>
  )
}

export default ItemCard