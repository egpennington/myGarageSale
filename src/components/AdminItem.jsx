import { formatCurrency } from '../utils/formatCurrency'

function AdminItem({ item }) {
  return (
    <article className="admin-item">
      <div>
        <h2>{item.title}</h2>
        <p>{item.description}</p>
        <strong>{formatCurrency(item.price)}</strong>
        <p>Status: {item.status}</p>
      </div>

      <div className="admin-actions">
        <button>Edit</button>
        <button>{item.status === 'published' ? 'Unpublish' : 'Publish'}</button>
        <button>Mark Sold</button>
        <button className="danger-button">Delete</button>
      </div>
    </article>
  )
}

export default AdminItem