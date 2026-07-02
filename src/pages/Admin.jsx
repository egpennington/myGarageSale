import sampleItems from '../data/sampleItems'
import AdminItem from '../components/AdminItem'
import ItemForm from '../components/ItemForm'

function Admin() {
  return (
    <section>
      <h1><i className="fa-solid fa-unlock"></i> Admin Page</h1>
      <p>Manage your garage sale listings.</p>

      <ItemForm />

      <div className="admin-list">
        {sampleItems.map((item) => (
          <AdminItem key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}

export default Admin