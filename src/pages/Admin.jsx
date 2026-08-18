import { useRef } from 'react'
import AdminItem from '../components/AdminItem'
import ItemForm from '../components/ItemForm'
import appConfig from '../config/appConfig'
import SellerSettings from '../components/SellerSettings'

function Admin({
  items,
  setItems,
  handleAddItem,
  handleDelete,
  handleTogglePublish,
  handleToggleSold,
  editingItem,
  setEditingItem,
  handleUpdateItem,
  settings,
  handleUpdateSettings,
}) {
  const formRef = useRef(null)

  function handleEdit(item) {
    setEditingItem(item)

    formRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  return (
    <section>
      <h1>Admin Page</h1>
      <p>Manage your garage sale listings. Build v{appConfig.version}</p>

      <SellerSettings
        settings={settings}
        handleUpdateSettings={handleUpdateSettings}
      />

      <div ref={formRef}>
        <ItemForm
          setItems={setItems}
          handleAddItem={handleAddItem}
          editingItem={editingItem}
          setEditingItem={setEditingItem}
          handleUpdateItem={handleUpdateItem}
        />
      </div>

      <h2 className="section-title">Current Listings</h2>

      <div className="admin-list">
        {items.map((item) => (
          <AdminItem
            key={item.id}
            item={item}
            handleDelete={handleDelete}
            handleTogglePublish={handleTogglePublish}
            handleToggleSold={handleToggleSold}
            handleEdit={handleEdit}
          />
        ))}
      </div>
    </section>
  )
}

export default Admin