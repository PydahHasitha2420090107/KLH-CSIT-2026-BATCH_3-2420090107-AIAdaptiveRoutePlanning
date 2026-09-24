import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'

export function RouteOptimization() {
  return (
    <>
      <div className="page-header-row">
        <div>
          <div className="eyebrow">Route optimization</div>
          <h2>AI route engine</h2>
        </div>
        <Button>Run optimization</Button>
      </div>

      <div className="content-grid two-col">
        <Card title="Optimization inputs">
          <form className="stack-form">
            <div className="two-field-grid">
              <label className="field"><span className="field-label">Pickup location</span><input defaultValue="Colombo 07 Residence" /></label>
              <label className="field"><span className="field-label">Destination</span><input defaultValue="Kandy Residence" /></label>
            </div>
            <div className="two-field-grid">
              <label className="field"><span className="field-label">Transport type</span><select defaultValue="House Shifting"><option>House Shifting</option><option>Sand Transportation</option><option>Construction Materials</option><option>Furniture Transportation</option></select></label>
              <label className="field"><span className="field-label">Vehicle requirement</span><select defaultValue="Medium Covered Truck"><option>Medium Covered Truck</option><option>Heavy Lorry</option><option>Van</option><option>Mini Van</option></select></label>
            </div>
          </form>
        </Card>

        <Card title="Recommended routes">
          <div className="stack-list compact">
            <div className="notice-item success"><strong>Route A</strong><small>152 km • 3h 42m</small></div>
            <div className="notice-item info"><strong>Route B</strong><small>146 km • 3h 21m</small></div>
            <div className="notice-item warning"><strong>Route C</strong><small>158 km • 3h 58m</small></div>
          </div>
        </Card>
      </div>

      <Card title="AI recommendation summary">
        <p className="route-description">AI Recommended Route: Route B for House Shifting</p>
        <p className="route-description">Recommended vehicle: Medium Covered Truck (V-104)</p>
        <p className="route-description">Recommendation can consider distance, travel time, vehicle suitability, traffic-related information, and route characteristics.</p>
        <p className="route-description"><strong>Dijkstra Shortest Path</strong> is the logical underpinning used by the backend route service response.</p>
      </Card>
    </>
  )
}
