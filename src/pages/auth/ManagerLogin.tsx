import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { useAuth } from '../../context/AuthContext'

export function ManagerLogin() {
  const [email, setEmail] = useState('manager@smartfleet.io')
  const [password, setPassword] = useState('password123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    const user = await login(email, password, 'manager')
    setLoading(false)

    if (!user) {
      setError('Unable to sign in as manager.')
      return
    }

    navigate('/manager')
  }

  return (
    <AuthLayout role="manager">
      <div className="auth-header">
        <div className="eyebrow">Manager access</div>
        <h2>Fleet control center</h2>
        <p>Monitor fleet utilization, maintenance, AI insights, and service health.</p>
      </div>

      <div className="role-switcher">
        <Link to="/login/user" className="role-card">Customer</Link>
        <Link to="/login/driver" className="role-card">Driver</Link>
        <Link to="/login/manager" className="role-card active">Manager</Link>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <Input label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        <div className="auth-row">
          <label className="checkbox-row"><input type="checkbox" defaultChecked /> Remember me</label>
          <Link to="/login" className="text-link">Forgot password?</Link>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <Button type="submit" className="full-width" disabled={loading}>{loading ? 'Logging in...' : 'Login as Manager'}</Button>
      </form>
      <p className="auth-switch">New manager? <Link to="/register/manager" className="text-link">Create an account</Link></p>
    </AuthLayout>
  )
}
