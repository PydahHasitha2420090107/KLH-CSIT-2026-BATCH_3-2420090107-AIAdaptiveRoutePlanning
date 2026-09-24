import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { mockTrips, mockShipments, mockVehicles } from '../../mocks/mockData'

export function DriverDashboard() {
  return (
    <>
      <div className="page-header-row">
        <div>
          <div className="eyebrow">Driver operations</div>
          <h2>Today’s assignments</h2>
        </div>
      </div>

      <div className="stats-grid five-col">
        <Card><div className="stat-card"><div className="stat-value">04</div><div className="stat-label">Today's Trips</div></div></Card>
        <Card><div className="stat-card"><div className="stat-value">02</div><div className="stat-label">Assigned Requests</div></div></Card>
        <Card><div className="stat-card"><div className="stat-value">01</div><div className="stat-label">Pending Pickups</div></div></Card>
        <Card><div className="stat-card"><div className="stat-value">01</div><div className="stat-label">Completed Requests</div></div></Card>
        <Card><div className="stat-card"><div className="stat-value">{mockVehicles[0].id}</div><div className="stat-label">Current Vehicle</div></div></Card>
      </div>

      <div className="content-grid two-col">
        <Card title="Today's Assignment">
          <div className="table-wrap compact">
            <table>
              <thead>
                <tr><th>Transport ID</th><th>Transport Type</th><th>Pickup</th><th>Destination</th><th>Load</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {mockShipments.slice(0,3).map((shipment) => (
                  <tr key={shipment.id}><td>{shipment.id}</td><td>{shipment.type}</td><td>{shipment.origin}</td><td>{shipment.destination}</td><td>{shipment.weight}</td><td><Badge tone={shipment.status === 'Delayed' ? 'warning' : 'info'}>{shipment.status}</Badge></td><td><button className="inline-action">View</button></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Current Trip">
          <div className="trip-summary">
            <div><span>Pickup</span><strong>{mockTrips[0].source}</strong></div>
            <div><span>Destination</span><strong>{mockTrips[0].destination}</strong></div>
            <div><span>Distance</span><strong>{mockTrips[0].distance}</strong></div>
            <div><span>Estimated Time</span><strong>{mockTrips[0].estimatedTime}</strong></div>
            <div><span>Route</span><strong>{mockTrips[0].route}</strong></div>
            <div><span>Transport Request</span><strong>{mockTrips[0].shipmentId}</strong></div>
          </div>
          <div className="button-row">
            <button className="btn btn-primary">Start Trip</button>
            <button className="btn btn-secondary">Mark Picked Up</button>
            <button className="btn btn-secondary">Update Status</button>
            <button className="btn btn-success">Mark Delivered</button>
          </div>
        </Card>
      </div>
    </>
  )
}
