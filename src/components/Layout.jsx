import Header from './Header'
import Footer from './Footer'

function Layout({ children, user }) {
  return (
    <main className="container">
      <Header user={user} />
      <main>{children}</main>
      <Footer user={user} />
    </main>
  )
}

export default Layout