import { formatCurrency } from '../utils/formatCurrency'

function AdminItem({ item, handleDelete, handleTogglePublish, handleToggleSold, }) {
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
        <button onClick={() => handleTogglePublish(item.id)}>
          {item.status === 'published' ? 'Unpublish' : 'Publish'}
        </button>
        <button onClick={() => handleToggleSold(item.id)}>
          {item.status === 'sold' ? 'Mark Available' : 'Mark Sold'}
        </button>
        <button
          className="danger-button"
          onClick={() => handleDelete(item.id)}
        >
          Delete
        </button>
      </div>
    </article>
  )
}

export default AdminItem