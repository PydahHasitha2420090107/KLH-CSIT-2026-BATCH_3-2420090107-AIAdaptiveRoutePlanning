import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'

export function DriverRouteNavigation() {
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
          <div className="detail-list">
            <div><span>Pickup Location</span><strong>Colombo 07 Residence</strong></div>
            <div><span>Destination</span><strong>Kandy Residence</strong></div>
            <div><span>Distance</span><strong>115 km</strong></div>
            <div><span>Estimated Time</span><strong>3h 40m</strong></div>
            <div><span>Traffic Status</span><strong>Moderate</strong></div>
            <div><span>Transport Type</span><strong>House Shifting</strong></div>
            <div><span>Recommended Route</span><strong>Route B</strong></div>
          </div>
        </Card>

        <Card title="Route alternatives">
          <div className="stack-list compact">
            <div className="notice-item success"><strong>Route A</strong><small>152 km • 3h 42m</small></div>
            <div className="notice-item info"><strong>Route B</strong><small>146 km • 3h 21m</small></div>
            <div className="notice-item warning"><strong>Route C</strong><small>158 km • 3h 58m</small></div>
          </div>
        </Card>
      </div>

      <Card title="Map view">
        <div className="route-map-box route-box-large">
          <div className="map-node origin">Current</div>
          <div className="map-node destination">Destination</div>
          <div className="route-line route-line-large" />
        </div>
        <p className="route-description">Recommended based on predicted travel time and route efficiency.</p>
      </Card>
    </>
  )
}
