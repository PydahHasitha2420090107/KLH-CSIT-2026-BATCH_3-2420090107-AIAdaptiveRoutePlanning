import type { ReactNode } from 'react'

export function Card({ title, children, action, className = '' }: { title?: string; children: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={`card ${className}`.trim()}>
      {(title || action) && (
        <div className="card-header">
          {title && <h3>{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  )
}
