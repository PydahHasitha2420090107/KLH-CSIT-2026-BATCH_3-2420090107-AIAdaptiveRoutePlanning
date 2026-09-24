import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { mockShipments } from '../../mocks/mockData'

export function MyShipments() {
  return (
    <Card title="My Transport Requests">
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Transport ID</th>
              <th>Transport Type</th>
              <th>Pickup</th>
              <th>Destination</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Vehicle</th>
            </tr>
          </thead>
          <tbody>
            {mockShipments.map((shipment) => (
              <tr key={shipment.id}>
                <td>{shipment.id}</td>
                <td>{shipment.type}</td>
                <td>{shipment.origin}</td>
                <td>{shipment.destination}</td>
                <td><Badge tone={shipment.status === 'Delayed' ? 'warning' : shipment.status === 'Delivered' ? 'success' : 'info'}>{shipment.status}</Badge></td>
                <td>{shipment.priority}</td>
                <td>{shipment.vehicle}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
