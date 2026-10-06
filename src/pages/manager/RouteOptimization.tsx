import { useEffect, useState } from 'react'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { RouteMap } from '../../components/maps/RouteMap'
import { routeService, type SmartFleetRoute } from '../../services/routeService'
import { shipmentService } from '../../services/shipmentService'
import type { Shipment } from '../../types'

export function RouteOptimization() {
  const [origin, setOrigin] = useState('Colombo, Sri Lanka')
  const [destination, setDestination] = useState('Kandy, Sri Lanka')
  const [transportType, setTransportType] = useState('General Goods')
  const [vehicleRequirement, setVehicleRequirement] = useState('Truck')
  const [recommendation, setRecommendation] = useState<SmartFleetRoute | null>(null)
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [selectedShipmentId, setSelectedShipmentId] = useState('')
  const [optimizing, setOptimizing] = useState(false)
  const [optimizationError, setOptimizationError] = useState('')

  useEffect(() => {
    let active = true
    void shipmentService.fetchAllShipments()
      .then((result) => { if (active) setShipments(result) })
      .catch(() => { if (active) setShipments([]) })
    return () => { active = false }
  }, [])

  const selectShipment = (id: string) => {
    setSelectedShipmentId(id)
    const shipment = shipments.find((item) => item.id === id)
    if (shipment) {
      setOrigin(shipment.origin)
      setDestination(shipment.destination)
      setRecommendation(null)
    }
  }

  const runOptimization = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setOptimizing(true)
    setOptimizationError('')
    try {
      setRecommendation(await routeService.optimizeRoute(origin, destination))
    } catch {
      setRecommendation(null)
      setOptimizationError('SmartFleet route optimization is unavailable for these locations.')
    } finally {
      setOptimizing(false)
    }
  }

  return (
    <>
      <div className="page-header-row">
        <div>
          <div className="eyebrow">Route optimization</div>
          <h2>AI route engine</h2>
        </div>
        <Button type="submit" form="route-optimization-form" disabled={optimizing}>{optimizing ? 'Optimizing...' : 'Run optimization'}</Button>
      </div>

      <div className="content-grid two-col">
        <Card title="Optimization inputs">
          <form id="route-optimization-form" className="stack-form" onSubmit={(event) => void runOptimization(event)}>
            {shipments.length > 0 && <label className="field"><span className="field-label">Use shipment locations</span><select value={selectedShipmentId} onChange={(event) => selectShipment(event.target.value)}><option value="">Enter locations manually</option>{shipments.map((shipment) => <option key={shipment.id} value={shipment.id}>{shipment.id} · {shipment.type} · {shipment.status}</option>)}</select></label>}
            <div className="two-field-grid">
              <label className="field"><span className="field-label">Pickup location</span><input required value={origin} onChange={(event) => setOrigin(event.target.value)} /></label>
              <label className="field"><span className="field-label">Destination</span><input required value={destination} onChange={(event) => setDestination(event.target.value)} /></label>
            </div>
            <div className="two-field-grid">
              <label className="field"><span className="field-label">Transport type</span><select value={transportType} onChange={(event) => setTransportType(event.target.value)}><option>E-commerce Delivery</option><option>Parcel Delivery</option><option>General Goods</option><option>House Shifting</option><option>Sand Transportation</option><option>Construction Materials</option><option>Furniture Transportation</option><option>Business Delivery</option><option>Warehouse Delivery</option><option>Other</option></select></label>
              <label className="field"><span className="field-label">Vehicle requirement</span><select value={vehicleRequirement} onChange={(event) => setVehicleRequirement(event.target.value)}><option>Truck</option><option>Heavy Lorry</option><option>Van</option><option>Mini Van</option></select></label>
            </div>
          </form>
        </Card>

        <Card title="SmartFleet algorithm recommendation">
          {optimizationError && <p className="route-map-error-text" role="alert">{optimizationError}</p>}
          {recommendation ? (
            <div className="detail-list">
              <div><span>Algorithm</span><strong>{recommendation.algorithmUsed}</strong></div>
              <div><span>Recommended path</span><strong>{recommendation.recommendedRoute.join(' → ')}</strong></div>
              <div><span>Graph distance estimate</span><strong>{recommendation.distance}</strong></div>
              <div><span>Graph time estimate</span><strong>{recommendation.estimatedDuration}</strong></div>
              <div><span>Transport type</span><strong>{transportType}</strong></div>
              <div><span>Vehicle requirement</span><strong>{vehicleRequirement}</strong></div>
            </div>
          ) : (
            <p className="route-description">Run optimization to request SmartFleet's Dijkstra recommendation. The map below shows OpenStreetMap road geometry when a valid route can be fetched.</p>
          )}
        </Card>
      </div>

      <Card title="OpenStreetMap road route">
        <RouteMap origin={origin} destination={destination} smartFleetRoute={recommendation?.recommendedRoute} smartFleetDistance={recommendation?.distance} smartFleetDuration={recommendation?.estimatedDuration} height={440} />
      </Card>

      <Card title="Route decision layers">
        <div className="stack-list compact">
          <div className="notice-item info"><strong>SmartFleet Dijkstra</strong><small>Computes the graph-based recommendation when Run optimization is selected.</small></div>
          <div className="notice-item success"><strong>OpenStreetMap geometry</strong><small>Draws the actual road-following path when public road geometry is available and reports the route distance and time.</small></div>
        </div>
      </Card>
    </>
  )
}
