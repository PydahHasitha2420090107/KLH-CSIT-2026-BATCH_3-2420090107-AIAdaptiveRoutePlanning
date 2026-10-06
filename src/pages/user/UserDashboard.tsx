import { useEffect, useState } from 'react'
import { ArrowRight, PackageCheck, Truck, Clock3, MapPinned } from 'lucide-react'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Link } from 'react-router-dom'
import { Badge } from '../../components/common/Badge'
import { shipmentService, type UserDashboardData } from '../../services/shipmentService'
import { useShipments } from '../../hooks/useShipments'

export function UserDashboard() {
  const { shipments, loading: shipmentsLoading, error: shipmentsError } = useShipments()
  const [dashboard, setDashboard] = useState<UserDashboardData | null>(null)
  const [dashboardError, setDashboardError] = useState('')

  useEffect(() => {
    let active = true
    void shipmentService.fetchUserDashboard()
      .then((result) => { if (active) setDashboard(result) })
      .catch((cause: unknown) => {
        if (active) setDashboardError(cause instanceof Error ? cause.message : 'Unable to load dashboard data.')
      })
    return () => { active = false }
  }, [])

  const stats = dashboard ? [
    { label: 'Active Transport Requests', value: dashboard.stats.activeTransportRequests, icon: PackageCheck },
    { label: 'Completed Requests', value: dashboard.stats.completedRequests, icon: Truck },
    { label: 'Pending Requests', value: dashboard.stats.pendingRequests, icon: Clock3 },
    { label: 'Delayed Requests', value: dashboard.stats.delayedRequests, icon: MapPinned },
  ] : []
  const activeShipment = dashboard?.activeShipment
    ? shipments.find((shipment) => shipment.id === dashboard.activeShipment?.id) ?? null
    : null

  if (dashboardError || shipmentsError) {
    return <div className="empty-state-box" role="alert">Unable to load the customer dashboard: {dashboardError || shipmentsError}</div>
  }
  if (!dashboard || shipmentsLoading) return <div className="empty-state-box" role="status">Loading customer dashboard...</div>

  return (
    <>
      <div className="page-header-row">
        <div>
          <div className="eyebrow">Customer console</div>
          <h2>Transport request overview</h2>
        </div>
        <Link to="/user/create-shipment"><Button>+ Request Transport</Button></Link>
      </div>

      <div className="stats-grid three-col">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <div className="stat-card">
              <div className="stat-icon"><Icon size={18} /></div>
              <div>
                <div className="stat-value">{value}</div>
                <div className="stat-label">{label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="content-grid two-col">
        <Card title="Track Your Transport Request" className="panel-highlight">
          <div className="shipment-tracker">
            <div className="tracker-row">
              <span>Transport ID</span>
              <strong>{activeShipment?.id ?? 'No active request'}</strong>
            </div>
            <div className="tracker-row">
              <span>Current Status</span>
              {activeShipment ? <Badge tone="success">{activeShipment.status}</Badge> : <strong>Unavailable</strong>}
            </div>
            <div className="tracker-row">
              <span>Current Location</span>
              <strong>{activeShipment?.currentLocation ?? 'No active location'}</strong>
            </div>
            <div className="tracker-row">
              <span>Estimated Arrival</span>
              <strong>{activeShipment?.estimatedDelivery ?? 'Unavailable'}</strong>
            </div>
            <div className="progress-label">
              <span>Progress</span>
              <strong>{activeShipment?.progress ?? 0}%</strong>
            </div>
            <div className="progress-bar"><span style={{ width: `${activeShipment?.progress ?? 0}%` }} /></div>
          </div>
        </Card>

        <Card title="Transport Request Timeline">
          <ul className="timeline-list">
            {['Request Created', 'Vehicle Assigned', 'Driver Assigned', 'Loading', 'In Transit', 'Near Destination', 'Completed'].map((step, index) => (
              <li key={step} className={index <= 4 ? 'complete' : ''}>
                <span className="dot" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="My Recent Transport Requests" action={<Link to="/user/my-shipments" className="text-link">View all</Link>}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Transport ID</th>
                <th>Pickup</th>
                <th>Destination</th>
                <th>Status</th>
                <th>Vehicle</th>
                <th>Estimated Arrival</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((shipment) => (
                <tr key={shipment.id}>
                  <td>{shipment.id}</td>
                  <td>{shipment.origin}</td>
                  <td>{shipment.destination}</td>
                  <td><Badge tone={shipment.status === 'Delayed' ? 'warning' : shipment.status === 'Delivered' ? 'success' : 'info'}>{shipment.status}</Badge></td>
                  <td>{shipment.vehicle}</td>
                  <td>{shipment.estimatedDelivery}</td>
                  <td><Link to="/user/track-shipment" className="text-link">View <ArrowRight size={14} /></Link></td>
                </tr>
              ))}
              {shipments.length === 0 && <tr><td colSpan={7}>No transport requests are linked to your account.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
