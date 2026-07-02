import Header from './Header'
import Footer from './Footer'

function Layout({ children }) {
  return (
    <main className="container">
      <Header />
      <main>{children}</main>
      <Footer />
    </main>
  )
}

export default Layout