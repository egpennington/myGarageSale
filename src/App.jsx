import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
// import { collection, getDocs } from 'firebase/firestore'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
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

  async function handleDelete(id) {
    try {
      await deleteDoc(doc(db, 'items', id))

      setItems((currentItems) =>
        currentItems.filter((item) => item.id !== id)
      )

      if (editingItem?.id === id) {
        setEditingItem(null)
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('The listing could not be deleted.')
    }
  }

  async function handleTogglePublish(id) {
    const currentItem = items.find((item) => item.id === id)

    if (!currentItem) {
      return
    }

    const newStatus =
      currentItem.status === 'published'
        ? 'draft'
        : 'published'

    try {
      await updateDoc(doc(db, 'items', id), {
        status: newStatus,
      })

      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === id
            ? { ...item, status: newStatus }
            : item
        )
      )
    } catch (error) {
      console.error('Error changing publish status:', error)
      alert('The listing status could not be changed.')
    }
  }

  async function handleToggleSold(id) {
    const currentItem = items.find((item) => item.id === id)

    if (!currentItem) {
      return
    }

    const newStatus =
      currentItem.status === 'sold'
        ? 'published'
        : 'sold'

    try {
      await updateDoc(doc(db, 'items', id), {
        status: newStatus,
      })

      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === id
            ? { ...item, status: newStatus }
            : item
        )
      )
    } catch (error) {
      console.error('Error changing sold status:', error)
      alert('The sold status could not be changed.')
    }
  }

  async function handleUpdateItem(updatedItem) {
    try {
      const itemRef = doc(db, 'items', updatedItem.id)

      const itemData = {
        title: updatedItem.title,
        price: updatedItem.price,
        description: updatedItem.description,
        status: updatedItem.status,
        image: updatedItem.image,
      }

      await updateDoc(itemRef, itemData)

      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === updatedItem.id
            ? updatedItem
            : item
        )
      )

      setEditingItem(null)
    } catch (error) {
      console.error('Error updating item:', error)
      alert('The listing could not be updated.')
    }
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