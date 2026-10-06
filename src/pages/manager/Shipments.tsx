import { useEffect, useState } from 'react'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { shipmentService } from '../../services/shipmentService'
import { driverService } from '../../services/driverService'
import { vehicleService } from '../../services/vehicleService'
import type { Shipment } from '../../types'

export function Shipments() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [drivers, setDrivers] = useState<Awaited<ReturnType<typeof driverService.fetchAvailable>>>([])
  const [vehicles, setVehicles] = useState<Awaited<ReturnType<typeof vehicleService.fetchAvailable>>>([])
  const [assignment, setAssignment] = useState<Record<string, { vehicleId: string; driverId: string }>>({})
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [workingId, setWorkingId] = useState('')

  useEffect(() => {
    let active = true
    void Promise.all([shipmentService.fetchAllShipments(), driverService.fetchAvailable(), vehicleService.fetchAvailable()])
      .then(([items, availableDrivers, availableVehicles]) => {
        if (!active) return
        setShipments(items)
        setDrivers(availableDrivers)
        setVehicles(availableVehicles)
        setError('')
      })
      .catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : 'Unable to load transport operations.') })
    return () => { active = false }
  }, [])

  const updateAssignment = (shipmentId: string, field: 'vehicleId' | 'driverId', value: string) => {
    setAssignment((current) => ({ ...current, [shipmentId]: { vehicleId: current[shipmentId]?.vehicleId ?? '', driverId: current[shipmentId]?.driverId ?? '', [field]: value } }))
  }

  const assign = async (shipment: Shipment) => {
    const selection = assignment[shipment.id]
    if (!selection?.vehicleId || !selection.driverId) {
      setNotice('Choose both an available vehicle and an available driver.')
      return
    }
    setWorkingId(shipment.id)
    setNotice('')
    try {
      const result = await shipmentService.assign(shipment.id, selection.vehicleId, selection.driverId)
      setNotice(`Assigned ${result.id}; trip ${result.tripId} was created.`)
      const [items, availableDrivers, availableVehicles] = await Promise.all([shipmentService.fetchAllShipments(), driverService.fetchAvailable(), vehicleService.fetchAvailable()])
      setShipments(items)
      setDrivers(availableDrivers)
      setVehicles(availableVehicles)
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : 'Unable to assign this transport request.')
    } finally {
      setWorkingId('')
    }
  }

  if (error) return <div className="empty-state-box" role="alert">Unable to load transport requests: {error}</div>
  if (shipments.length === 0) return <div className="empty-state-box" role="status">Loading transport requests or none are recorded.</div>

  return (
    <Card title="Transport request management">
      {notice && <p role="status" className="route-description">{notice}</p>}
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
              <th>Assignment</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((shipment) => (
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
                <td className="action-cell">
                  {shipment.status === 'Pending' || shipment.vehicle === 'Unassigned' ? <div className="assignment-controls">
                    <select aria-label={`Vehicle for ${shipment.id}`} value={assignment[shipment.id]?.vehicleId ?? ''} onChange={(event) => updateAssignment(shipment.id, 'vehicleId', event.target.value)}>
                      <option value="">Choose vehicle</option>{vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.id} · {vehicle.type}</option>)}
                    </select>
                    <select aria-label={`Driver for ${shipment.id}`} value={assignment[shipment.id]?.driverId ?? ''} onChange={(event) => updateAssignment(shipment.id, 'driverId', event.target.value)}>
                      <option value="">Choose driver</option>{drivers.map((driver) => <option key={driver.id} value={driver.id}>{driver.name}</option>)}
                    </select>
                    <button className="inline-action" disabled={workingId === shipment.id || !vehicles.length || !drivers.length} onClick={() => void assign(shipment)}>{workingId === shipment.id ? 'Assigning...' : 'Assign'}</button>
                  </div> : 'Assigned'}
                </td>
              </tr>
            ))}
            {shipments.length === 0 && <tr><td colSpan={12}>No transport requests are recorded.</td></tr>}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
