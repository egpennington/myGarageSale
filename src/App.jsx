import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'

import Layout from './components/Layout'
import Splash from './pages/Splash'
import Store from './pages/Store'
import Admin from './pages/Admin'
import sampleItems from './data/sampleItems'

function App() {
  const [items, setItems] = useState(sampleItems)
  const [editingItem, setEditingItem] = useState(null)

  function handleDelete(id) {
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== id)
    )
  }

  function handleTogglePublish(id) {
    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== id) {
          return item
        }

        return {
          ...item,
          status: item.status === 'published' ? 'draft' : 'published',
        }
      })
    )
  }

  function handleToggleSold(id) {
    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== id) {
          return item
        }

        return {
          ...item,
          status: item.status === 'sold' ? 'published' : 'sold',
        }
      })
    )
  }

  function handleUpdateItem(updatedItem) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === updatedItem.id ? updatedItem : item
      )
    )

    setEditingItem(null)
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Splash />} />

        <Route
          path="/store"
          element={<Store items={items} />}
        />

        <Route
          path="/admin"
          element={
            <Admin
              items={items}
              setItems={setItems}
              handleDelete={handleDelete}
              handleTogglePublish={handleTogglePublish}
              handleToggleSold={handleToggleSold}
              handleUpdateItem={handleUpdateItem}
            />
          }
        />
      </Routes>
    </Layout>
  )
}

export default App