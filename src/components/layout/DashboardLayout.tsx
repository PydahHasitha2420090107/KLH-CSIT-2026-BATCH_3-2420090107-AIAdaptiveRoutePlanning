import { Bell, LogOut, Menu, UserCircle2 } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import type { UserRole } from '../../types'
import type { ReactNode } from 'react'

const navMap: Record<UserRole, { label: string; to: string }[]> = {
  user: [
    { label: 'Dashboard', to: '/user' },
    { label: 'My Transport Requests', to: '/user/my-shipments' },
    { label: 'Request Transport', to: '/user/create-shipment' },
    { label: 'Track Transport', to: '/user/track-shipment' },
    { label: 'Notifications', to: '/notifications' },
    { label: 'Settings', to: '/settings' },
  ],
  driver: [
    { label: 'Dashboard', to: '/driver' },
    { label: 'Assigned Transport Requests', to: '/driver/shipments' },
    { label: 'Route Navigation', to: '/driver/routes' },
    { label: 'Vehicle', to: '/driver/vehicle' },
    { label: 'Notifications', to: '/notifications' },
    { label: 'Settings', to: '/settings' },
  ],
  manager: [
    { label: 'Dashboard', to: '/manager' },
    { label: 'Vehicles', to: '/manager/vehicles' },
    { label: 'Drivers', to: '/manager/drivers' },
    { label: 'Transport Requests', to: '/manager/shipments' },
    { label: 'Maintenance', to: '/manager/maintenance' },
    { label: 'Route Optimization', to: '/manager/route-optimization' },
    { label: 'AI Recommendations', to: '/manager/ai-recommendations' },
    { label: 'Fleet Analytics', to: '/manager/fleet-analytics' },
    { label: 'Notifications', to: '/notifications' },
    { label: 'Settings', to: '/settings' },
  ],
}

export function DashboardLayout({ children }: { children?: ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) {
    return null
  }

  const items = navMap[user.role]

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-wrap">
          <div className="brand-mark">SF</div>
          <div>
            <div className="brand-name">SmartFleet</div>
            <div className="brand-subtitle">AI Logistics Platform</div>
          </div>
        </div>

        <nav className="nav-menu">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button type="button" className="nav-item danger" onClick={handleLogout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="topbar-left">
            <button type="button" className="icon-btn mobile-only" aria-label="Open navigation">
              <Menu size={18} />
            </button>
            <div>
              <div className="eyebrow">Operations control</div>
              <h1>{user.role === 'user' ? 'Customer Dashboard' : user.role === 'driver' ? 'Driver Dashboard' : 'Manager Dashboard'}</h1>
            </div>
          </div>

          <div className="topbar-actions">
            <button type="button" className="icon-btn" aria-label="Notifications">
              <Bell size={18} />
            </button>
            <div className="user-chip">
              <UserCircle2 size={20} />
              <span>{user.name}</span>
            </div>
          </div>
        </header>

        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  )
}
