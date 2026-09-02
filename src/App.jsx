import { useEffect, useState } from 'react'
import { Navigate, Routes, Route } from 'react-router-dom'
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, updateDoc,} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db, storage } from './firebase/firebase'
import { deleteObject, getDownloadURL, ref, uploadBytes, } from 'firebase/storage'

import Layout from './components/Layout'
import Splash from './pages/Splash'
import Store from './pages/Store'
import Admin from './pages/Admin'
import Login from './pages/Login'
import ItemDetails from './pages/ItemDetails'

function App() {
  const [items, setItems] = useState([])
  const [editingItem, setEditingItem] = useState(null)
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [itemsLoading, setItemsLoading] = useState(true)
  const [settings, setSettings] = useState(null)

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
      } finally {
        setItemsLoading(false)
      }
    }

    loadItems()
  }, [])

  // gets seller info
  useEffect(() => {
    async function loadSettings() {
      try {
        const settingsRef = doc(db, 'settings', 'site')
        const settingsSnapshot = await getDoc(settingsRef)

        if (settingsSnapshot.exists()) {
          setSettings(settingsSnapshot.data())
        }
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }

    loadSettings()
  }, [])

  async function handleAddItem( newItem, imageFiles, mainImageIndex ) {
      try {
        let uploadedImages = []

        if (imageFiles.length > 0) {
          uploadedImages = await Promise.all(
            imageFiles.map(async (imageFile) => {
              const imagePath =
                `items/${crypto.randomUUID()}-${imageFile.name}`

              const imageRef = ref(storage, imagePath)

              await uploadBytes(imageRef, imageFile)

              const imageUrl = await getDownloadURL(imageRef)

              return {
                url: imageUrl,
                path: imagePath,
              }
            })
          )
        }

      const mainImage = uploadedImages[mainImageIndex]

      const otherImages = uploadedImages.filter(
        (_, index) => index !== mainImageIndex
      )

      const orderedImages = mainImage
        ? [mainImage, ...otherImages]
        : []

      console.log('selected main index:', mainImageIndex)
      console.log('uploaded:', uploadedImages)
      console.log('ordered:', orderedImages)

      const itemData = {
        ...newItem,
        images: orderedImages,
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

  async function handleUpdateItem(
    updatedItem,
    imageFiles,
    mainImageIndex
  ) {
    try {
      const itemRef = doc(db, 'items', updatedItem.id)

      let savedImages = updatedItem.images || []

      if (imageFiles.length > 0) {
        const uploadedImages = await Promise.all(
          imageFiles.map(async (imageFile) => {
            const imagePath =
              `items/${crypto.randomUUID()}-${imageFile.name}`

            const imageRef = ref(storage, imagePath)

            await uploadBytes(imageRef, imageFile)

            const imageUrl = await getDownloadURL(imageRef)

            return {
              url: imageUrl,
              path: imagePath,
            }
          })
        )

        const mainImage = uploadedImages[mainImageIndex]

        const otherImages = uploadedImages.filter(
          (_, index) => index !== mainImageIndex
        )

        const orderedNewImages = mainImage
          ? [mainImage, ...otherImages]
          : uploadedImages

        savedImages = [
          ...savedImages,
          ...orderedNewImages,
        ]
      }

      const itemData = {
        title: updatedItem.title,
        price: updatedItem.price,
        description: updatedItem.description,
        status: updatedItem.status,
        category: updatedItem.category,
        images: savedImages,
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

  async function handleUpdateSettings(updatedSettings) {
    try {
      const settingsRef = doc(db, 'settings', 'site')

      await updateDoc(settingsRef, updatedSettings)

      setSettings(updatedSettings)
    } catch (error) {
      console.error('Error updating settings:', error)
      alert('Seller settings could not be updated.')
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
          path="/store/:itemId"
          element={
            <ItemDetails 
              items={items} 
              itemsLoading={itemsLoading}
              settings={settings}
            />
          }
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
                settings={settings}
                handleUpdateSettings={handleUpdateSettings}
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