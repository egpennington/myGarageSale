import { NavLink } from 'react-router-dom'

function Footer({ user }) {
  return (
    <footer>
      <p>&copy; 2026 myGarageSale</p>

      {!user && (
        <NavLink to="/login">
          <i className="fa-solid fa-lock"></i> Admin Login
        </NavLink>
      )}
    </footer>
  )
}

export default Footer