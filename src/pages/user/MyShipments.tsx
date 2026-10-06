import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { useShipments } from '../../hooks/useShipments'

export function MyShipments() {
  const { shipments, loading, error } = useShipments()

  if (loading) return <div className="empty-state-box" role="status">Loading transport requests...</div>
  if (error) return <div className="empty-state-box" role="alert">Unable to load transport requests: {error}</div>

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
            {shipments.map((shipment) => (
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
            {shipments.length === 0 && <tr><td colSpan={7}>No transport requests are linked to your account.</td></tr>}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
