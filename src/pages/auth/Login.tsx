import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { useAuth } from '../../context/AuthContext'

export function Login() {
  const [email, setEmail] = useState('customer@smartfleet.io')
  const [password, setPassword] = useState('password123')
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    const user = await login(email, password)
    setLoading(false)

    if (!user) {
      setError('Invalid email, password, or selected account type.')
      return
    }

    navigate(`/${user.role}`)
  }

  return (
    <AuthLayout role="user">
      <div className="auth-header">
        <div className="eyebrow">Welcome back</div>
        <h2>Sign in to SmartFleet</h2>
        <p>Access your fleet, shipment, and route intelligence dashboard.</p>
      </div>

      <div className="role-switcher">
        <Link to="/login/user" className="role-card active">Customer</Link>
        <Link to="/login/driver" className="role-card">Driver</Link>
        <Link to="/login/manager" className="role-card">Manager</Link>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <Input label="Email or username" type="email" value={email} onChange={(event) => setEmail(event.target.value)} error={error ? 'Please check your credentials.' : ''} />
        <Input label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} error={error ? 'Please check your credentials.' : ''} />

        <div className="auth-row">
          <label className="checkbox-row">
            <input type="checkbox" checked={remember} onChange={() => setRemember((value) => !value)} />
            Remember me
          </label>
          <Link to="/login" className="text-link">Forgot password?</Link>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <Button type="submit" className="full-width" disabled={loading}>
          {loading ? 'Signing in...' : 'Login'}
        </Button>
      </form>

      <div className="new-user-panel">
        <strong>New to SmartFleet?</strong>
        <span>Create an account for your role:</span>
        <div className="new-user-actions">
          <Link to="/register/user" className="text-link">Customer</Link>
          <Link to="/register/driver" className="text-link">Driver</Link>
          <Link to="/register/manager" className="text-link">Manager</Link>
        </div>
      </div>
    </AuthLayout>
  )
}
