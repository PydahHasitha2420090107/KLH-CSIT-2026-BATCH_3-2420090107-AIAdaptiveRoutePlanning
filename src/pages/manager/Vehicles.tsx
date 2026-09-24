import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Badge } from '../../components/common/Badge'
import { mockVehicles } from '../../mocks/mockData'

export function Vehicles() {
  return (
    <>
      <div className="page-header-row">
        <div>
          <div className="eyebrow">Fleet management</div>
          <h2>Vehicles</h2>
        </div>
        <Button>+ Add Vehicle</Button>
      </div>

      <Card title="Vehicle fleet">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Vehicle ID</th>
                <th>Registration Number</th>
                <th>Type</th>
                <th>Status</th>
                <th>Condition</th>
                <th>Mileage</th>
                <th>Fuel Efficiency</th>
                <th>Maintenance Risk</th>
                <th>Assigned Driver</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockVehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td>{vehicle.id}</td>
                  <td>{vehicle.registrationNumber}</td>
                  <td>{vehicle.type}</td>
                  <td><Badge tone={vehicle.status === 'Maintenance' ? 'warning' : vehicle.status === 'Available' ? 'success' : 'info'}>{vehicle.status}</Badge></td>
                  <td>{vehicle.condition}</td>
                  <td>{vehicle.mileage.toLocaleString()} km</td>
                  <td>{vehicle.fuelEfficiency} km/L</td>
                  <td>{vehicle.maintenanceRisk}%</td>
                  <td>{vehicle.assignedDriver}</td>
                  <td className="action-cell"><button className="inline-action">View</button> <button className="inline-action">Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
