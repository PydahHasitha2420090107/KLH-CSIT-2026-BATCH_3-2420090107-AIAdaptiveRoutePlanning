import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { useAuth } from '../../context/AuthContext'

export function DriverLogin() {
  const [email, setEmail] = useState('driver@smartfleet.io')
  const [password, setPassword] = useState('password123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    const user = await login(email, password, 'driver')
    setLoading(false)

    if (!user) {
      setError('Unable to sign in as driver.')
      return
    }

    navigate('/driver')
  }

  return (
    <AuthLayout role="driver">
      <div className="auth-header">
        <div className="eyebrow">Driver access</div>
        <h2>Operational access</h2>
        <p>View assigned routes, shipments, and vehicle status.</p>
      </div>

      <div className="role-switcher">
        <Link to="/login/user" className="role-card">Customer</Link>
        <Link to="/login/driver" className="role-card active">Driver</Link>
        <Link to="/login/manager" className="role-card">Manager</Link>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <Input label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        <div className="auth-row">
          <label className="checkbox-row"><input type="checkbox" defaultChecked /> Remember me</label>
          <Link to="/login" className="text-link">Forgot password?</Link>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <Button type="submit" className="full-width" disabled={loading}>{loading ? 'Logging in...' : 'Login as Driver'}</Button>
      </form>
      <p className="auth-switch">New driver? <Link to="/register/driver" className="text-link">Create an account</Link></p>
    </AuthLayout>
  )
}
