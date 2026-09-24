import type { ReactNode } from 'react'

export function AuthLayout({ children, role }: { children: ReactNode; role: 'user' | 'driver' | 'manager' }) {
  const roleCopy = {
    user: { label: 'Customer', accent: 'Customer Portal', tone: 'user' },
    driver: { label: 'Driver', accent: 'Field Operations', tone: 'driver' },
    manager: { label: 'Manager', accent: 'Fleet Control Center', tone: 'manager' },
  }[role]

  return (
    <div className="auth-shell">
      <div className="auth-visual">
        <div className="auth-brand">
          <div className="brand-mark large">SF</div>
          <div>
            <div className="brand-name">SmartFleet</div>
            <div className="brand-subtitle">AI-Based Smart Transport Fleet & Shipment Management System</div>
          </div>
        </div>

        <div className="auth-panel-copy">
          <div className={`pill pill-${roleCopy.tone}`}>{roleCopy.label}</div>
          <h2>{roleCopy.accent}</h2>
          <p>Monitor fleet health, optimize routes, track shipments, and use AI to improve decision-making across every stage of the transport workflow.</p>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-content">{children}</div>
      </div>
    </div>
  )
}
