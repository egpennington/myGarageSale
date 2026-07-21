import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
// import { collection, getDocs } from 'firebase/firestore'
import {
  addDoc,
  collection,
  getDocs,
} from 'firebase/firestore'

import Layout from './components/Layout'
import Splash from './pages/Splash'
import Store from './pages/Store'
import Admin from './pages/Admin'
import { db } from './firebase/firebase'
// import sampleItems from './data/sampleItems'

function App() {
  // const [items, setItems] = useState(sampleItems)
  const [items, setItems] = useState([])
  const [editingItem, setEditingItem] = useState(null)

  useEffect(() => {
    async function loadItems() {
      try {
        const querySnapshot = await getDocs(collection(db, 'items'))

        const firestoreItems = querySnapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }))

        setItems(firestoreItems)
      } catch (error) {
        console.error('Error loading items:', error)
      }
    }

    loadItems()
  }, [])

  async function handleAddItem(newItem) {
    try {
      const docRef = await addDoc(
        collection(db, 'items'),
        newItem
      )

      const itemWithId = {
        id: docRef.id,
        ...newItem,
      }

      setItems((currentItems) => [
        ...currentItems,
        itemWithId,
      ])
    } catch (error) {
      console.error('Error adding item:', error)
      alert('The listing could not be saved.')
    }
  }

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
              handleAddItem={handleAddItem}
              handleDelete={handleDelete}
              handleTogglePublish={handleTogglePublish}
              handleToggleSold={handleToggleSold}
              editingItem={editingItem}
              setEditingItem={setEditingItem}
              handleUpdateItem={handleUpdateItem}
            />
          }
        />
      </Routes>
    </Layout>
  )
}

export default App