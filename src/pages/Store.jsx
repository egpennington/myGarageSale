import sampleItems from '../data/sampleItems'
import ItemCard from '../components/ItemCard'

function Store() {
  const publishedItems = sampleItems.filter(
    (item) => item.status === 'published' || item.status === 'sold'
  )

  return (
    <section>
      <h1><i className="fa-solid fa-shop"></i> Store Front</h1>

      <div className="item-grid">
        {publishedItems.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}

export default Store