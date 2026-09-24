import { Navigate, useLocation } from 'react-router-dom'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../types'

interface ProtectedRouteProps {
  allowedRoles?: UserRole[]
  children: React.ReactNode
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="page-shell"><div className="loader-box">Loading session...</div></div>
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />
  }

  return <DashboardLayout>{children}</DashboardLayout>
}
