import sampleItems from '../data/sampleItems'
import AdminItem from '../components/AdminItem'

function Admin() {
  return (
    <section>
      <h1><i className="fa-solid fa-unlock"></i> Admin Page</h1>
      <p>Manage your garage sale listings.</p>

      <div className="admin-list">
        {sampleItems.map((item) => (
          <AdminItem key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}

export default Admin