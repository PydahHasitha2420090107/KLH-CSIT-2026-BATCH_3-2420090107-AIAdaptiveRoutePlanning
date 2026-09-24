import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { mockShipments } from '../../mocks/mockData'

export function Shipments() {
  return (
    <Card title="Transport request management">
      <div className="toolbar-row">
        <input placeholder="Search transport requests" className="toolbar-input" />
        <select className="toolbar-select"><option>All transport types</option><option>House Shifting</option><option>Sand Transportation</option><option>Construction Materials</option><option>Furniture Transportation</option><option>Goods Transportation</option><option>Other</option></select>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Transport ID</th>
              <th>Customer</th>
              <th>Transport Type</th>
              <th>Pickup</th>
              <th>Destination</th>
              <th>Vehicle</th>
              <th>Driver</th>
              <th>Load</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Estimated Delivery</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockShipments.map((shipment) => (
              <tr key={shipment.id}>
                <td>{shipment.id}</td>
                <td>{shipment.customer}</td>
                <td>{shipment.type}</td>
                <td>{shipment.origin}</td>
                <td>{shipment.destination}</td>
                <td>{shipment.vehicle}</td>
                <td>{shipment.driver}</td>
                <td>{shipment.weight}</td>
                <td><Badge tone={shipment.status === 'Delayed' ? 'warning' : shipment.status === 'Delivered' ? 'success' : 'info'}>{shipment.status}</Badge></td>
                <td>{shipment.priority}</td>
                <td>{shipment.estimatedDelivery}</td>
                <td className="action-cell"><button className="inline-action">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
