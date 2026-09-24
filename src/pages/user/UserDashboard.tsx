import { ArrowRight, PackageCheck, Truck, Clock3, MapPinned } from 'lucide-react'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Link } from 'react-router-dom'
import { mockShipments } from '../../mocks/mockData'
import { Badge } from '../../components/common/Badge'

export function UserDashboard() {
  const stats = [
    { label: 'Active Transport Requests', value: '12', icon: PackageCheck },
    { label: 'Completed Requests', value: '46', icon: Truck },
    { label: 'Pending Requests', value: '8', icon: Clock3 },
    { label: 'Delayed Requests', value: '3', icon: MapPinned },
  ]

  return (
    <>
      <div className="page-header-row">
        <div>
          <div className="eyebrow">Customer console</div>
          <h2>Transport request overview</h2>
        </div>
        <Link to="/user/create-shipment"><Button>+ Request Transport</Button></Link>
      </div>

      <div className="stats-grid three-col">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <div className="stat-card">
              <div className="stat-icon"><Icon size={18} /></div>
              <div>
                <div className="stat-value">{value}</div>
                <div className="stat-label">{label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="content-grid two-col">
        <Card title="Track Your Transport Request" className="panel-highlight">
          <div className="shipment-tracker">
            <div className="tracker-row">
              <span>Transport ID</span>
              <strong>{mockShipments[0].id}</strong>
            </div>
            <div className="tracker-row">
              <span>Current Status</span>
              <Badge tone="success">{mockShipments[0].status}</Badge>
            </div>
            <div className="tracker-row">
              <span>Current Location</span>
              <strong>{mockShipments[0].currentLocation}</strong>
            </div>
            <div className="tracker-row">
              <span>Estimated Arrival</span>
              <strong>{mockShipments[0].estimatedDelivery}</strong>
            </div>
            <div className="progress-label">
              <span>Progress</span>
              <strong>{mockShipments[0].progress}%</strong>
            </div>
            <div className="progress-bar"><span style={{ width: `${mockShipments[0].progress}%` }} /></div>
          </div>
        </Card>

        <Card title="Transport Request Timeline">
          <ul className="timeline-list">
            {['Request Created', 'Vehicle Assigned', 'Driver Assigned', 'Loading', 'In Transit', 'Near Destination', 'Completed'].map((step, index) => (
              <li key={step} className={index <= 4 ? 'complete' : ''}>
                <span className="dot" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="My Recent Transport Requests" action={<Link to="/user/my-shipments" className="text-link">View all</Link>}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Transport ID</th>
                <th>Pickup</th>
                <th>Destination</th>
                <th>Status</th>
                <th>Vehicle</th>
                <th>Estimated Arrival</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {mockShipments.map((shipment) => (
                <tr key={shipment.id}>
                  <td>{shipment.id}</td>
                  <td>{shipment.origin}</td>
                  <td>{shipment.destination}</td>
                  <td><Badge tone={shipment.status === 'Delayed' ? 'warning' : shipment.status === 'Delivered' ? 'success' : 'info'}>{shipment.status}</Badge></td>
                  <td>{shipment.vehicle}</td>
                  <td>{shipment.estimatedDelivery}</td>
                  <td><Link to="/user/track-shipment" className="text-link">View <ArrowRight size={14} /></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
