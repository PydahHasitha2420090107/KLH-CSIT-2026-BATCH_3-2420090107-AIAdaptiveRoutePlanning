import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../../components/common/Badge'
import { Card } from '../../components/common/Card'
import { dashboardService, type DriverDashboardData } from '../../services/dashboardService'
import { tripService } from '../../services/tripService'

export function DriverRequests() {
  const [dashboard, setDashboard] = useState<DriverDashboardData | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [updatingTrip, setUpdatingTrip] = useState(false)

  const loadDashboard = async () => {
    try {
      setDashboard(await dashboardService.fetchDriver())
      setError('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load assigned transport requests.')
    }
  }

  useEffect(() => {
    void loadDashboard()
  }, [])

  const handleTripAction = async (action: 'start' | 'complete') => {
    if (!dashboard?.currentTrip) return
    setUpdatingTrip(true)
    setMessage('')
    try {
      if (action === 'start') await tripService.start(dashboard.currentTrip.id)
      else await tripService.complete(dashboard.currentTrip.id)
      setMessage(action === 'start' ? 'Trip started successfully.' : 'Trip completed successfully.')
      await loadDashboard()
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'Unable to update the trip status.')
    } finally {
      setUpdatingTrip(false)
    }
  }

  const activeTrip = dashboard?.currentTrip ?? null

  if (error) return <div className="empty-state-box" role="alert">Unable to load assigned transport requests: {error}</div>
  if (!dashboard) return <div className="empty-state-box" role="status">Loading assigned transport requests...</div>

  return (
    <>
      <div className="page-header-row">
        <div>
          <div className="eyebrow">Driver operations</div>
          <h2>Assigned Transport Requests</h2>
        </div>
      </div>

      {activeTrip && (
        <Card title="Active trip">
          <div className="detail-list">
            <div><span>Trip</span><strong>{activeTrip.id}</strong></div>
            <div><span>Shipment</span><strong>{activeTrip.shipmentId}</strong></div>
            <div><span>Pickup</span><strong>{activeTrip.source}</strong></div>
            <div><span>Destination</span><strong>{activeTrip.destination}</strong></div>
            <div><span>Status</span><strong>{activeTrip.status}</strong></div>
          </div>
          <div className="button-row">
            <button type="button" className="btn btn-primary" disabled={updatingTrip || activeTrip.status === 'In Progress'} onClick={() => void handleTripAction('start')}>Start Trip</button>
            <button type="button" className="btn btn-success" disabled={updatingTrip || activeTrip.status === 'Completed'} onClick={() => void handleTripAction('complete')}>Complete Trip</button>
            <Link to="/driver/routes" className="btn btn-secondary">View Route</Link>
          </div>
          {message && <p role="status">{message}</p>}
        </Card>
      )}

      <Card title="Assigned requests">
        <div className="table-wrap compact">
          <table>
            <thead>
              <tr>
                <th>Shipment</th>
                <th>Pickup</th>
                <th>Destination</th>
                <th>Assigned Vehicle</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.assignments.map((shipment) => {
                const hasActiveTrip = activeTrip?.shipmentId === shipment.id
                return (
                  <tr key={shipment.id}>
                    <td>{shipment.id}</td>
                    <td>{shipment.origin}</td>
                    <td>{shipment.destination}</td>
                    <td>{dashboard.stats.currentVehicle ?? 'Not assigned'}</td>
                    <td><Badge tone={shipment.status === 'Delayed' ? 'warning' : shipment.status === 'Delivered' ? 'success' : 'info'}>{shipment.status}</Badge></td>
                    <td>
                      <div className="button-row compact-row">
                        <Link to="/driver/routes" className="inline-action">View Route</Link>
                        {hasActiveTrip && activeTrip && (
                          <button type="button" className="inline-action" disabled={updatingTrip} onClick={() => void handleTripAction(activeTrip.status === 'In Progress' ? 'complete' : 'start')}>
                            {activeTrip.status === 'In Progress' ? 'Complete Trip' : 'Start Trip'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {dashboard.assignments.length === 0 && <tr><td colSpan={6}>No transport requests are assigned to your driver account.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
