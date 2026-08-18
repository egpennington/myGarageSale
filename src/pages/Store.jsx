import { useState } from 'react'
import ItemCard from '../components/ItemCard'

function Store({ items }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortOption, setSortOption] = useState("default")

  const visibleItems = items.filter((item) => {

    const matchesStatus =
      item.status === 'published' || item.status === 'sold'

    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory =
      selectedCategory === 'all' ||
      item.category.toLowerCase() === selectedCategory.toLowerCase()

    return matchesStatus && matchesSearch && matchesCategory
  })

  const sortedItems = [...visibleItems].sort((a, b) => {
    if (sortOption === 'price-low') {
        return a.price - b.price
    }

    if (sortOption === 'price-high') {
        return b.price - a.price
    }

    if (sortOption === 'az') {
        return a.title.localeCompare(b.title)
    }

    if (sortOption === 'za') {
        return b.title.localeCompare(a.title)
    }

    return 0
  })

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

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}  
        >
          <option value="all">All Categories</option>
          <option value ="art">Art</option>
          <option value="books">Books</option>
          <option value="electronics">Electronics</option>
          <option value="furniture">Furniture</option>
          <option value="tools">Tools</option>
          <option value="dvd">DVD</option>
          <option value="other">Other</option>          
        </select>

        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="default">Sort By</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="az">Name: A–Z</option>
          <option value="za">Name: Z–A</option>
        </select>
      </div>

      {sortedItems.length > 0 ? (
        <div className="item-grid">
          {sortedItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <p className="empty-message">
          No listings match your search or category.
        </p>
      )}
    </section>
  )
}

export default Store