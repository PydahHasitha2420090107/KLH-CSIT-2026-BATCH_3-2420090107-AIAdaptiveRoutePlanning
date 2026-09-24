import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { useAuth } from '../../context/AuthContext'
import type { UserRole } from '../../types'

const roleLabels: Record<UserRole, string> = {
  user: 'Customer',
  driver: 'Driver',
  manager: 'Manager',
}

const roleDescriptions: Record<UserRole, string> = {
  user: 'Request local transportation and track your goods movement.',
  driver: 'Manage assigned transport requests, routes, and vehicle status.',
  manager: 'Monitor fleet operations, drivers, requests, and AI insights.',
}

export function Register({ role }: { role: UserRole }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { register } = useAuth()
  const label = roleLabels[role]

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const user = await register({ name, email, password, phone, role })
    setLoading(false)

    if (!user) {
      setError('An account with this email already exists, or registration is unavailable.')
      return
    }

    navigate(`/${user.role}`)
  }

  return (
    <AuthLayout role={role}>
      <div className="auth-header">
        <div className="eyebrow">Create account</div>
        <h2>Join SmartFleet as a {label.toLowerCase()}</h2>
        <p>{roleDescriptions[role]}</p>
      </div>

      <div className="role-switcher">
        <Link to="/register/user" className={`role-card ${role === 'user' ? 'active' : ''}`}>Customer</Link>
        <Link to="/register/driver" className={`role-card ${role === 'driver' ? 'active' : ''}`}>Driver</Link>
        <Link to="/register/manager" className={`role-card ${role === 'manager' ? 'active' : ''}`}>Manager</Link>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <Input label="Full name" value={name} onChange={(event) => setName(event.target.value)} required />
        <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <Input label="Contact number" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} required />
        <Input label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        <Input label="Confirm password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
        {error && <div className="alert alert-error">{error}</div>}
        <Button type="submit" className="full-width" disabled={loading}>{loading ? 'Creating account...' : `Create ${label} Account`}</Button>
        <p className="auth-switch">Already have an account? <Link to={`/login/${role}`} className="text-link">Sign in as {label}</Link></p>
      </form>
    </AuthLayout>
  )
}
