import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Badge } from '../../components/common/Badge'
import { mockDrivers } from '../../mocks/mockData'

export function Drivers() {
  return (
    <>
      <div className="page-header-row">
        <div>
          <div className="eyebrow">Operations</div>
          <h2>Drivers</h2>
        </div>
        <Button>+ Add Driver</Button>
      </div>

      <Card title="Driver roster">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Driver ID</th>
                <th>Name</th>
                <th>License</th>
                <th>Availability</th>
                <th>Assigned Vehicle</th>
                <th>Current Trip</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockDrivers.map((driver) => (
                <tr key={driver.id}>
                  <td>{driver.id}</td>
                  <td>{driver.name}</td>
                  <td>{driver.license}</td>
                  <td>{driver.availability}</td>
                  <td>{driver.assignedVehicle}</td>
                  <td>{driver.currentTrip}</td>
                  <td><Badge tone={driver.status === 'Active' ? 'success' : 'warning'}>{driver.status}</Badge></td>
                  <td className="action-cell"><button className="inline-action">View</button> <button className="inline-action">Assign</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
