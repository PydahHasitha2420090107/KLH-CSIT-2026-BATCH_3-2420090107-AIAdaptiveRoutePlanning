import { useEffect, useState } from 'react'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Badge } from '../../components/common/Badge'
import { driverService } from '../../services/driverService'
import type { Driver } from '../../types'

export function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    void driverService.fetchDrivers().then((items) => { if (active) setDrivers(items) }).catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : 'Unable to load drivers.') })
    return () => { active = false }
  }, [])

  if (error) return <div className="empty-state-box" role="alert">Unable to load drivers: {error}</div>
  if (drivers.length === 0) return <div className="empty-state-box" role="status">Loading drivers or no drivers are recorded.</div>

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
              {drivers.map((driver) => (
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
