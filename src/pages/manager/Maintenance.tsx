import { useEffect, useState } from 'react'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { vehicleService } from '../../services/vehicleService'
import type { Vehicle } from '../../types'

export function Maintenance() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    void vehicleService.fetchVehicles().then((items) => { if (active) setVehicles(items) }).catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : 'Unable to load maintenance data.') })
    return () => { active = false }
  }, [])

  if (error) return <div className="empty-state-box" role="alert">Unable to load maintenance data: {error}</div>
  if (vehicles.length === 0) return <div className="empty-state-box" role="status">Loading maintenance data or no vehicles are recorded.</div>

  const highRisk = vehicles.filter((vehicle) => vehicle.maintenanceRisk > 60).length
  const mediumRisk = vehicles.filter((vehicle) => vehicle.maintenanceRisk > 40 && vehicle.maintenanceRisk <= 60).length
  const lowRisk = vehicles.filter((vehicle) => vehicle.maintenanceRisk <= 40).length

  return (
    <>
      <div className="page-header-row">
        <div>
          <div className="eyebrow">Maintenance intelligence</div>
          <h2>Predictive maintenance</h2>
        </div>
      </div>

      <div className="stats-grid three-col">
        <Card><div className="stat-card"><div className="stat-value">{highRisk}</div><div className="stat-label">High Risk Vehicles</div></div></Card>
        <Card><div className="stat-card"><div className="stat-value">{mediumRisk}</div><div className="stat-label">Medium Risk Vehicles</div></div></Card>
        <Card><div className="stat-card"><div className="stat-value">{lowRisk}</div><div className="stat-label">Low Risk Vehicles</div></div></Card>
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
              {vehicles.map((vehicle) => (
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
