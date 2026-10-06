import { useEffect, useState } from 'react'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { RouteMap } from '../../components/maps/RouteMap'
import { dashboardService, type DriverDashboardData } from '../../services/dashboardService'
import { routeService } from '../../services/routeService'

export function DriverRouteNavigation() {
  const [dashboard, setDashboard] = useState<DriverDashboardData | null>(null)
  const [error, setError] = useState('')
  const [recommendedRoute, setRecommendedRoute] = useState<string[]>([])

  useEffect(() => {
    let active = true
    void dashboardService.fetchDriver()
      .then((result) => { if (active) setDashboard(result) })
      .catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : 'Unable to load the current trip.') })
    return () => { active = false }
  }, [])

  const trip = dashboard?.currentTrip ?? null

  useEffect(() => {
    if (!trip?.source || !trip.destination) {
      setRecommendedRoute([])
      return
    }
    let active = true
    void routeService.optimizeRoute(trip.source, trip.destination)
      .then((result) => { if (active) setRecommendedRoute(result.recommendedRoute) })
      .catch(() => { if (active) setRecommendedRoute([]) })
    return () => { active = false }
  }, [trip?.destination, trip?.source])

  if (error) return <div className="empty-state-box" role="alert">Unable to load route guidance: {error}</div>
  if (!dashboard) return <div className="empty-state-box" role="status">Loading current trip...</div>

  return (
    <>
      <div className="page-header-row">
        <div>
          <div className="eyebrow">Route navigation</div>
          <h2>Current route guidance</h2>
        </div>
        <Badge tone="success">AI Recommended Route</Badge>
      </div>

      <div className="content-grid two-col">
        <Card title="Route overview">
          {trip ? <div className="detail-list">
            <div><span>Pickup Location</span><strong>{trip.source}</strong></div>
            <div><span>Destination</span><strong>{trip.destination}</strong></div>
            <div><span>Current Trip</span><strong>{trip.id}</strong></div>
            <div><span>Transport Request</span><strong>{trip.shipmentId}</strong></div>
            <div><span>SmartFleet route decision</span><strong>{recommendedRoute.length ? recommendedRoute.join(' → ') : 'Unavailable for these locations'}</strong></div>
          </div> : <div className="empty-state-box">There is no current trip assigned to your account.</div>}
        </Card>

        <Card title="Route guidance">
          <p className="route-description">The route is displayed with OpenStreetMap road geometry when the pickup and destination can be located. No live vehicle GPS is currently available for this trip.</p>
        </Card>
      </div>

      <Card title="Current trip route map">
        {trip ? <RouteMap origin={trip.source} destination={trip.destination} smartFleetRoute={recommendedRoute} smartFleetDistance={dashboard.currentTrip?.distance} smartFleetDuration={dashboard.currentTrip?.estimatedTime} height={440} /> : <RouteMap height={440} />}
      </Card>
    </>
  )
}
