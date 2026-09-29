import { formatCurrency } from '../utils/formatCurrency';
import { Link } from 'react-router-dom';

function ItemCard({ item }) {
  const mainImage = item.images?.[0]?.url || item.image;

  const words = item.description?.split(' ') || [];
  const shortDescription =
    words.length > 15 ? `${words.slice(0, 15).join(' ')}...` : item.description;

  return (
    <Link to={`/store/${item.id}`} className="item-card-link">
      <article className="item-card">
        <div className="item-card__image">
          {mainImage ? (
            <img src={mainImage} alt={item.title} />
          ) : (
            <span>No photo</span>
          )}

          {item.sold && <span className="sold-badge">Sold</span>}
        </div>

        <div className="item-card__body">
          <h2>{item.title}</h2>
          <p>{shortDescription}</p>
          <strong>{formatCurrency(item.price)}</strong>
        </div>
      </article>
    </Link>
  );
}

export default ItemCard;
