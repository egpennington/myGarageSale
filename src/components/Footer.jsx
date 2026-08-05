import { NavLink } from 'react-router-dom'
import appConfig from '../config/appConfig'

function Footer({ user }) {
  return (
    <footer>
      <p>&copy; {appConfig.year} {appConfig.name} v{appConfig.version}</p>

      {!user && (
        <NavLink to="/login">
          <i className="fa-solid fa-lock"></i> Admin Login
        </NavLink>
      )}
    </footer>
  )
}

export default Footer