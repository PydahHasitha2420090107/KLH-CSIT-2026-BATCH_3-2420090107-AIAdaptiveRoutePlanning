import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { mockVehicles } from '../../mocks/mockData'

export function Maintenance() {
  return (
    <>
      <div className="page-header-row">
        <div>
          <div className="eyebrow">Maintenance intelligence</div>
          <h2>Predictive maintenance</h2>
        </div>
      </div>

      <div className="stats-grid three-col">
        <Card><div className="stat-card"><div className="stat-value">03</div><div className="stat-label">High Risk Vehicles</div></div></Card>
        <Card><div className="stat-card"><div className="stat-value">06</div><div className="stat-label">Medium Risk Vehicles</div></div></Card>
        <Card><div className="stat-card"><div className="stat-value">09</div><div className="stat-label">Low Risk Vehicles</div></div></Card>
      </div>

      <Card title="AI Maintenance Prediction">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Mileage</th>
                <th>Last Maintenance</th>
                <th>Condition</th>
                <th>Risk Score</th>
                <th>Risk Level</th>
                <th>Recommended Action</th>
              </tr>
            </thead>
            <tbody>
              {mockVehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td>{vehicle.id}</td>
                  <td>{vehicle.mileage.toLocaleString()} km</td>
                  <td>{vehicle.maintenanceDue}</td>
                  <td>{vehicle.condition}</td>
                  <td>{vehicle.maintenanceRisk}%</td>
                  <td><Badge tone={vehicle.maintenanceRisk > 60 ? 'danger' : vehicle.maintenanceRisk > 40 ? 'warning' : 'success'}>{vehicle.maintenanceRisk > 60 ? 'HIGH' : vehicle.maintenanceRisk > 40 ? 'MEDIUM' : 'LOW'}</Badge></td>
                  <td>{vehicle.maintenanceRisk > 60 ? 'Schedule inspection' : 'Monitor closely'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
