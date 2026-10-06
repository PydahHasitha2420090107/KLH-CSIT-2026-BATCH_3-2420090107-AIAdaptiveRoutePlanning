import { useEffect, useState } from 'react'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { dashboardService, type DriverDashboardData } from '../../services/dashboardService'
import { tripService } from '../../services/tripService'

export function DriverDashboard() {
  const [dashboard, setDashboard] = useState<DriverDashboardData | null>(null)
  const [error, setError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [updatingTrip, setUpdatingTrip] = useState(false)

  const loadDashboard = async () => {
    try {
      setDashboard(await dashboardService.fetchDriver())
      setError('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load driver assignments.')
    }
  }

  useEffect(() => { void loadDashboard() }, [])

  const updateTrip = async (action: 'start' | 'complete') => {
    if (!dashboard?.currentTrip) return
    setUpdatingTrip(true)
    setActionMessage('')
    try {
      if (action === 'start') await tripService.start(dashboard.currentTrip.id)
      else await tripService.complete(dashboard.currentTrip.id)
      setActionMessage(action === 'start' ? 'Trip started.' : 'Delivery marked complete.')
      await loadDashboard()
    } catch (cause) {
      setActionMessage(cause instanceof Error ? cause.message : 'Unable to update trip status.')
    } finally {
      setUpdatingTrip(false)
    }
  }

  if (error) return <div className="empty-state-box" role="alert">Unable to load driver dashboard: {error}</div>
  if (!dashboard) return <div className="empty-state-box" role="status">Loading driver assignments...</div>

  return (
    <>
      <div className="page-header-row">
        <div>
          <div className="eyebrow">Driver operations</div>
          <h2>Today’s assignments</h2>
        </div>
      </div>

      <div className="stats-grid five-col">
        <Card><div className="stat-card"><div className="stat-value">{dashboard.stats.todayTrips}</div><div className="stat-label">Assigned Trips</div></div></Card>
        <Card><div className="stat-card"><div className="stat-value">{dashboard.stats.assignedRequests}</div><div className="stat-label">Assigned Requests</div></div></Card>
        <Card><div className="stat-card"><div className="stat-value">{dashboard.stats.pendingPickups}</div><div className="stat-label">Pending Pickups</div></div></Card>
        <Card><div className="stat-card"><div className="stat-value">{dashboard.stats.completedRequests}</div><div className="stat-label">Completed Requests</div></div></Card>
        <Card><div className="stat-card"><div className="stat-value">{dashboard.stats.currentVehicle ?? 'None'}</div><div className="stat-label">Current Vehicle</div></div></Card>
      </div>

      <div className="content-grid two-col">
        <Card title="Today's Assignment">
          <div className="table-wrap compact">
            <table>
              <thead>
                <tr><th>Transport ID</th><th>Transport Type</th><th>Pickup</th><th>Destination</th><th>Load</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {dashboard.assignments.map((shipment) => (
                  <tr key={shipment.id}><td>{shipment.id}</td><td>{shipment.type}</td><td>{shipment.origin}</td><td>{shipment.destination}</td><td>{shipment.weight}</td><td><Badge tone={shipment.status === 'Delayed' ? 'warning' : 'info'}>{shipment.status}</Badge></td><td>{shipment.id}</td></tr>
                ))}
                {dashboard.assignments.length === 0 && <tr><td colSpan={7}>No transport assignments are linked to your driver account.</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Current Trip">
          {dashboard.currentTrip ? <>
            <div className="trip-summary">
              <div><span>Pickup</span><strong>{dashboard.currentTrip.source}</strong></div>
              <div><span>Destination</span><strong>{dashboard.currentTrip.destination}</strong></div>
              <div><span>Distance</span><strong>{dashboard.currentTrip.distance}</strong></div>
              <div><span>Estimated Time</span><strong>{dashboard.currentTrip.estimatedTime}</strong></div>
              <div><span>Route</span><strong>{dashboard.currentTrip.route}</strong></div>
              <div><span>Transport Request</span><strong>{dashboard.currentTrip.shipmentId}</strong></div>
              <div><span>Status</span><strong>{dashboard.currentTrip.status}</strong></div>
            </div>
            <div className="button-row">
              <button className="btn btn-primary" disabled={updatingTrip || dashboard.currentTrip.status === 'In Progress'} onClick={() => void updateTrip('start')}>Start Trip</button>
              <button className="btn btn-success" disabled={updatingTrip || dashboard.currentTrip.status === 'Completed'} onClick={() => void updateTrip('complete')}>Mark Delivered</button>
            </div>
            {actionMessage && <p role="status">{actionMessage}</p>}
          </> : <div className="empty-state-box">There is no current trip assigned to your account.</div>}
        </Card>
      </div>
    </>
  )
}
