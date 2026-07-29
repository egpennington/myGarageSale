import { NavLink } from 'react-router-dom'
import { signOut } from 'firebase/auth'

import { auth } from '../firebase/firebase'

function Header({user}) {
  return (
    <header>
      <h1>myGarageSale</h1>

      <nav>
        <NavLink to="/"><i className="fa-solid fa-house"></i> Home</NavLink>

        <NavLink to="/store"><i className="fa-solid fa-shop"></i> Browse Store</NavLink>
        
        {user && (
          <>
            <NavLink to="/admin">
              <i className="fa-solid fa-unlock"></i> Admin
            </NavLink>

            <button
              type="button"
              className="nav-button"
              onClick={() => signOut(auth)}
            >
              <i className="fa-solid fa-right-from-bracket"></i> Sign Out
            </button>
          </>
        )}
      </nav>
    </header>
  )
}

export default Header