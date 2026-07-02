import ItemCard from '../components/ItemCard'

function Store({ items }) {
  const visibleItems = items.filter((item) =>
    ['published', 'sold'].includes(item.status)
  )

  return (
    <section>
      <h1>Store Front</h1>

      <div className="item-grid">
        {visibleItems.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}

export default Store