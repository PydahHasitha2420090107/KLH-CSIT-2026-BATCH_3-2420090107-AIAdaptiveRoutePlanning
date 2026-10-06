import { useEffect, useState } from 'react'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { RouteMap } from '../../components/maps/RouteMap'
import { useShipments } from '../../hooks/useShipments'
import { routeService } from '../../services/routeService'

export function TrackShipment() {
  const { shipments, loading, error } = useShipments()
  const shipment = shipments.find((item) => item.status !== 'Delivered' && item.status !== 'Cancelled') ?? shipments[0]
  const [recommendedRoute, setRecommendedRoute] = useState<string[]>([])

  useEffect(() => {
    if (!shipment?.origin || !shipment.destination) return
    let active = true
    void routeService.optimizeRoute(shipment.origin, shipment.destination)
      .then((result) => { if (active) setRecommendedRoute(result.recommendedRoute) })
      .catch(() => { if (active) setRecommendedRoute([]) })
    return () => { active = false }
  }, [shipment?.destination, shipment?.origin])

  if (loading) return <div className="empty-state-box" role="status">Loading shipment tracking...</div>
  if (error) return <div className="empty-state-box" role="alert">Unable to load shipment tracking: {error}</div>
  if (!shipment) return <div className="empty-state-box">No transport requests are linked to your account.</div>

  return (
    <>
      <div className="page-header-row">
        <div>
          <div className="eyebrow">Transport request tracking</div>
          <h2>{shipment.id}</h2>
        </div>
        <Badge tone="success">{shipment.status}</Badge>
      </div>

      <div className="content-grid two-col">
        <Card title="Transport request details">
          <div className="detail-list">
            <div><span>Current Status</span><strong>{shipment.status}</strong></div>
            <div><span>Pickup</span><strong>{shipment.origin}</strong></div>
            <div><span>Destination</span><strong>{shipment.destination}</strong></div>
            <div><span>Assigned Vehicle</span><strong>{shipment.vehicle}</strong></div>
            <div><span>Assigned Driver</span><strong>{shipment.driver}</strong></div>
            <div><span>Estimated Arrival</span><strong>{shipment.estimatedDelivery}</strong></div>
          </div>
        </Card>

        <Card title="Route visualization">
          <RouteMap shipment={shipment} smartFleetRoute={recommendedRoute} height={360} />
        </Card>
      </div>

      <Card title="Transport request timeline">
        <div className="progress-timeline">
          {['Request Created', 'Vehicle Assigned', 'Driver Assigned', 'Loading', 'In Transit', 'Unloading', 'Completed'].map((step, index) => (
            <div key={step} className={`progress-step ${index <= 2 ? 'done' : ''}`}>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}
