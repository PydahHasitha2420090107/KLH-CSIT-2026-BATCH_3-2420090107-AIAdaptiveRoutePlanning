import { useEffect, useState } from 'react'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { dashboardService } from '../../services/dashboardService'
import { vehicleService } from '../../services/vehicleService'
import type { DriverDashboardData } from '../../services/dashboardService'
import type { Vehicle } from '../../types'

export function VehicleDetails() {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    void dashboardService.fetchDriver()
      .then(async (dashboard: DriverDashboardData) => {
        if (!dashboard.stats.currentVehicle) return null
        return vehicleService.getVehicleById(dashboard.stats.currentVehicle)
      })
      .then((result) => { if (active) setVehicle(result) })
      .catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : 'Unable to load assigned vehicle.') })
    return () => { active = false }
  }, [])

  if (error) return <div className="empty-state-box" role="alert">Unable to load assigned vehicle: {error}</div>
  if (!vehicle) return <div className="empty-state-box" role="status">Loading assigned vehicle or no vehicle is linked to your account.</div>

  return (
    <>
      <div className="page-header-row">
        <div>
          <div className="eyebrow">Vehicle health</div>
          <h2>{vehicle.id}</h2>
        </div>
        <Badge tone="success">Healthy</Badge>
      </div>

      <div className="stats-grid four-col">
        <Card><div className="stat-card"><div className="stat-value">{vehicle.registrationNumber}</div><div className="stat-label">Registration Number</div></div></Card>
        <Card><div className="stat-card"><div className="stat-value">{vehicle.type}</div><div className="stat-label">Vehicle Type</div></div></Card>
        <Card><div className="stat-card"><div className="stat-value">{vehicle.fuelLevel}%</div><div className="stat-label">Fuel Level</div></div></Card>
        <Card><div className="stat-card"><div className="stat-value">{vehicle.mileage} km</div><div className="stat-label">Mileage</div></div></Card>
      </div>

      <div className="content-grid two-col">
        <Card title="Vehicle health score">
          <div className="score-box">
            <div className="score-value">88</div>
            <div className="score-level">Maintenance Risk 31%</div>
          </div>
          <div className="progress-bar"><span style={{ width: '88%' }} /></div>
        </Card>

        <Card title="Maintenance warnings">
          <div className="stack-list compact">
            <div className="notice-item warning"><strong>Maintenance due</strong><small>{vehicle.maintenanceDue}</small></div>
            <div className="notice-item danger"><strong>Low fuel</strong><small>Current level {vehicle.fuelLevel}%</small></div>
            <div className="notice-item info"><strong>High maintenance risk</strong><small>31% risk score</small></div>
          </div>
        </Card>
      </div>
    </>
  )
}
