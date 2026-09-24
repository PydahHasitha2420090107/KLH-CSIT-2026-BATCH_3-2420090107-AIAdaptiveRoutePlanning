import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { mockShipments } from '../../mocks/mockData'

export function TrackShipment() {
  const shipment = mockShipments[0]

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
          <div className="route-map-box">
            <div className="map-node origin">Origin</div>
            <div className="map-node current">Current</div>
            <div className="map-node destination">Destination</div>
            <div className="route-line" />
          </div>
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
