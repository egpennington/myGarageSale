import AdminItem from '../components/AdminItem'
import ItemForm from '../components/ItemForm'

function Admin({
  items,
  setItems,
  handleDelete,
  handleTogglePublish,
  handleToggleSold,
  editingItem,
  setEditingItem,
  handleUpdateItem,
}) {
  return (
    <section>
      <h1>Admin Page</h1>
      <p>Manage your garage sale listings.</p>

      <ItemForm
        setItems={setItems}
        editingItem={editingItem}
        setEditingItem={setEditingItem}
        handleUpdateItem={handleUpdateItem}
      />

      <h2 className="section-title">Current Listings</h2>

      <div className="admin-list">
        {items.map((item) => (
          <AdminItem
            key={item.id}
            item={item}
            handleDelete={handleDelete}
            handleTogglePublish={handleTogglePublish}
            handleToggleSold={handleToggleSold}
            setEditingItem={setEditingItem}
          />
        ))}
      </div>
    </section>
  )
}

export default Admin