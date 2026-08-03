import { useEffect, useState } from 'react'
import { Navigate, Routes, Route } from 'react-router-dom'
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc,} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db, storage } from './firebase/firebase'
import { deleteObject, getDownloadURL, ref, uploadBytes, } from 'firebase/storage'

import Layout from './components/Layout'
import Splash from './pages/Splash'
import Store from './pages/Store'
import Admin from './pages/Admin'
import Login from './pages/Login'

function App() {
  const [items, setItems] = useState([])
  const [editingItem, setEditingItem] = useState(null)
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  // watch auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser)
        setAuthLoading(false)
      }
    )

    return unsubscribe
  }, [])

  // loads firestore listings
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

  async function handleAddItem(newItem, imageFile) {
    try {
      let imageUrl = ''
      let imagePath = ''

      if (imageFile) {
        imagePath = `items/${crypto.randomUUID()}-${imageFile.name}`

        const imageRef = ref(storage, imagePath)

        await uploadBytes(imageRef, imageFile)

        imageUrl = await getDownloadURL(imageRef)
      }

      const itemData = {
        ...newItem,
        image: imageUrl,
        imagePath,
      }

      const docRef = await addDoc(
        collection(db, 'items'),
        itemData
      )

      const itemWithId = {
        id: docRef.id,
        ...itemData,
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
      const currentItem = items.find((item) => item.id === id)

      if (!currentItem) {
        return
      }

      if (currentItem.imagePath) {
        const imageRef = ref(storage, currentItem.imagePath)
        await deleteObject(imageRef)
      }

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

  async function handleUpdateItem(updatedItem, imageFile) {
    try {
      const itemRef = doc(db, 'items', updatedItem.id)

      let imageUrl = updatedItem.image || ''
      let imagePath = updatedItem.imagePath || ''

      if (imageFile) {
        if (updatedItem.imagePath) {
          const oldImageRef = ref(storage, updatedItem.imagePath)
          await deleteObject(oldImageRef)
        }
        
        imagePath = `items/${crypto.randomUUID()}-${imageFile.name}`

        const imageRef = ref(storage, imagePath)

        await uploadBytes(imageRef, imageFile)

        imageUrl = await getDownloadURL(imageRef)
      }

      const itemData = {
        title: updatedItem.title,
        price: updatedItem.price,
        description: updatedItem.description,
        status: updatedItem.status,
        image: imageUrl,
        imagePath,
      }

      await updateDoc(itemRef, itemData)

      const savedItem = {
        ...updatedItem,
        ...itemData,
      }

      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === updatedItem.id
            ? savedItem
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
    <Layout user={user}>
      <Routes>
        <Route path="/" element={<Splash />} />

        <Route
          path="/store"
          element={<Store items={items} />}
        />

        <Route
          path="/login"
          element={<Login user={user} />}
        />

        <Route
          path="/admin"
          element={
            authLoading ? (
              <p>Checking authentication...</p>
            ) : user ? (
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
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Layout>
  )
}

export default App