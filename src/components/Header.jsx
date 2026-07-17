import { NavLink } from 'react-router-dom'

function Header() {
  return (
    <header>
      <h1>myGarageSale</h1>

      <nav>
        <NavLink to="/"><i className="fa-solid fa-house"></i> Home</NavLink>
        <NavLink to="/store"><i className="fa-solid fa-shop"></i>Browse Store</NavLink>
        <NavLink to="/admin"><i className="fa-solid fa-unlock"></i> Admin</NavLink>
      </nav>
    </header>
  )
}

export default Header