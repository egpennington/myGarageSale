import { useState } from 'react'
import ItemCard from '../components/ItemCard'

function Store({ items }) {
  const [searchTerm, setSearchTerm] = useState('')

  const visibleItems = items.filter(
    (item) =>
      (item.status === 'published' || item.status === 'sold') &&
      (
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
  )

  return (
    <section>
      <div className="store-heading">
        <h1>Store Front</h1>

        <label className="search-box">
          <i className="fa-solid fa-magnifying-glass"></i>

          <input
            type="search"
            placeholder="Search listings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </label>
      </div>

      {visibleItems.length > 0 ? (
        <div className="item-grid">
          {visibleItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <p className="empty-message">
          No listings match “{searchTerm}”.
        </p>
      )}
    </section>
  )
}

export default Store