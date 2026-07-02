import { Link } from 'react-router-dom'

function Header() {
  return (
    <header>
      <h1>myGarageSale</h1>

      <nav>
        <Link to="/"><i className="fa-solid fa-house"></i> Home</Link>
        <Link to="/store"><i className="fa-solid fa-shop"></i> Store</Link>
        <Link to="/admin"><i className="fa-solid fa-unlock"></i> Admin</Link>
      </nav>
    </header>
  )
}

export default Header