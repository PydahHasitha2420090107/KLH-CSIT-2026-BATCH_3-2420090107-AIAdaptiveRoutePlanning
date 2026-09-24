import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { mockAIPredictions } from '../../mocks/mockData'

export function AIRecommendations() {
  return (
    <Card title="AI Vehicle Allocation for Transport Requests">
      <div className="stack-list compact">
        {[
          { name: 'Vehicle V-104', score: 94, fuel: '14.2 km/L', risk: 'Low', status: 'Available' },
          { name: 'Vehicle V-102', score: 87, fuel: '12.8 km/L', risk: 'Medium', status: 'In Use' },
          { name: 'Vehicle V-107', score: 76, fuel: '11.7 km/L', risk: 'High', status: 'In Use' },
        ].map((vehicle) => (
          <div key={vehicle.name} className="recommendation-item">
            <div>
              <strong>{vehicle.name}</strong>
              <small>Suitability Score: {vehicle.score}%</small>
            </div>
            <div className="score-meta">
              <span>Fuel Efficiency: {vehicle.fuel}</span>
              <span>Maintenance Risk: {vehicle.risk}</span>
              <span>Availability: {vehicle.status}</span>
            </div>
            {vehicle.score === 94 && <Badge tone="success">AI Recommended</Badge>}
          </div>
        ))}
      </div>
      <div className="spacer-sml" />
      <div className="stack-list compact">
        {mockAIPredictions.map((item) => (
          <div key={item.id} className="notice-item info">
            <strong>{item.title}</strong>
            <small>{item.recommendation}</small>
          </div>
        ))}
      </div>
    </Card>
  )
}
