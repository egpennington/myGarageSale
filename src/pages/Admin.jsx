import sampleItems from '../data/sampleItems'
import ItemCard from '../components/ItemCard'

function Admin() {
  return (
    <section>
      <h1><i className="fa-solid fa-unlock"></i> Admin Page</h1>
      <p>Manage your garage sale listings.</p>

      <div className="admin-list">
        {sampleItems.map((item) => (
          <div className="admin-item" key={item.id}>
            <ItemCard item={item} />

            <div className="admin-actions">
              <button>Edit</button>
              <button>
                {item.status === 'published' ? 'Unpublish' : 'Publish'}
              </button>
              <button>Mark Sold</button>
              <button className="danger-button">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Admin