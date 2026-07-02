// React import isn't needed with the Vite/modern JSX transform
// unless importing something like useState or useEffect.

import { Routes, Route } from 'react-router-dom'
import Splash from './pages/Splash'
import Store from './pages/Store'
import Admin from './pages/Admin'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/store" element={<Store />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  )
}

export default App