
import AdminItem from '../components/AdminItem'
import ItemForm from '../components/ItemForm'

function Admin({ items, setItems }) {
  return (
    <section>
      <h1>Admin Page</h1>
      <p>Manage your garage sale listings.</p>

      <ItemForm setItems={setItems} />

      <h2 className="section-title">Current Listings</h2>

      <div className="admin-list">
        {items.map((item) => (
          <AdminItem key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}

export default Admin