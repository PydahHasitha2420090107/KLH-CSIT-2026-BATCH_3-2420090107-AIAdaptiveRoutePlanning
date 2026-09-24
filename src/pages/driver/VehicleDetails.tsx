import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { mockVehicles } from '../../mocks/mockData'

export function VehicleDetails() {
  const vehicle = mockVehicles[2]

  return (
    <>
      <div className="page-header-row">
        <div>
          <div className="eyebrow">Vehicle health</div>
          <h2>{vehicle.id}</h2>
        </div>
        <Badge tone="success">Healthy</Badge>
      </div>

      <div className="stats-grid four-col">
        <Card><div className="stat-card"><div className="stat-value">{vehicle.registrationNumber}</div><div className="stat-label">Registration Number</div></div></Card>
        <Card><div className="stat-card"><div className="stat-value">{vehicle.type}</div><div className="stat-label">Vehicle Type</div></div></Card>
        <Card><div className="stat-card"><div className="stat-value">{vehicle.fuelLevel}%</div><div className="stat-label">Fuel Level</div></div></Card>
        <Card><div className="stat-card"><div className="stat-value">{vehicle.mileage} km</div><div className="stat-label">Mileage</div></div></Card>
      </div>

      <div className="content-grid two-col">
        <Card title="Vehicle health score">
          <div className="score-box">
            <div className="score-value">88</div>
            <div className="score-level">Maintenance Risk 31%</div>
          </div>
          <div className="progress-bar"><span style={{ width: '88%' }} /></div>
        </Card>

        <Card title="Maintenance warnings">
          <div className="stack-list compact">
            <div className="notice-item warning"><strong>Maintenance due</strong><small>{vehicle.maintenanceDue}</small></div>
            <div className="notice-item danger"><strong>Low fuel</strong><small>Current level {vehicle.fuelLevel}%</small></div>
            <div className="notice-item info"><strong>High maintenance risk</strong><small>31% risk score</small></div>
          </div>
        </Card>
      </div>
    </>
  )
}
