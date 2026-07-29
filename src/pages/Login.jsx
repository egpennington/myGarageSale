import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'

import { auth } from '../firebase/firebase'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSigningIn, setIsSigningIn] = useState(false)

  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')
    setIsSigningIn(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/admin')
    } catch (error) {
      console.error(error)
      setError('Unable to sign in. Check your email and password.')
    } finally {
      setIsSigningIn(false)
    }
  }

  return (
    <section className="login-page">
        <div className="login-card">
            <h2>Admin Login</h2>

            <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email</label>
            <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
            />

            <label htmlFor="password">Password</label>
            <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
            />

            {error && <p className="error-message">{error}</p>}

            <button type="submit">
                Sign In
            </button>
            </form>
        </div>
    </section>
  )
}

export default Login