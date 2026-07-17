import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'

import Layout from './components/Layout'
import Splash from './pages/Splash'
import Store from './pages/Store'
import Admin from './pages/Admin'
import sampleItems from './data/sampleItems'

function App() {
  const [items, setItems] = useState(sampleItems)

  function handleDelete(id) {
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== id)
    )
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
            />
          }
        />
      </Routes>
    </Layout>
  )
}

export default App