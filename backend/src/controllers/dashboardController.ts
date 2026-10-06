import type { Request, Response } from 'express'
import { getDb } from '../db/database.js'
import { buildSuccess } from '../utils/response.js'

function normalizeStatus(status: string) {
  const value = status?.toString().trim().toUpperCase()
  if (value === 'PENDING' || value === 'REQUESTED') return 'Pending'
  if (value === 'ASSIGNED') return 'Assigned'
  if (value === 'PICKUP_STARTED' || value === 'LOADING') return 'In Transit'
  if (value === 'IN_TRANSIT' || value === 'NEAR_DESTINATION') return 'In Transit'
  if (value === 'DELIVERED' || value === 'COMPLETED') return 'Delivered'
  if (value === 'DELAYED') return 'Delayed'
  if (value === 'CANCELLED') return 'Cancelled'
  return status || 'Pending'
}

export const dashboardController = {
  user: (req: Request, res: Response) => {
    const db = getDb()
    const currentUserId = (req as any).user?.id || 'U-1001'
    const shipments = db.prepare('SELECT * FROM shipments WHERE customer_id = ? ORDER BY id DESC').all(currentUserId) as any[]

    const stats = {
      activeTransportRequests: shipments.filter((s) => ['Assigned', 'In Transit', 'Delayed'].includes(normalizeStatus(s.status))).length,
      completedRequests: shipments.filter((s) => normalizeStatus(s.status) === 'Delivered').length,
      pendingRequests: shipments.filter((s) => normalizeStatus(s.status) === 'Pending').length,
      delayedRequests: shipments.filter((s) => normalizeStatus(s.status) === 'Delayed').length,
    }

    const shipment = shipments[0] || null
    return res.json(buildSuccess({
      stats,
      activeShipment: shipment ? {
        id: shipment.id,
        status: normalizeStatus(shipment.status),
        currentLocation: shipment.current_location,
        estimatedDelivery: shipment.estimated_delivery,
        progress: shipment.progress,
      } : null,
      recentShipments: shipments.slice(0, 5).map((s) => ({
        id: s.id,
        origin: s.origin,
        destination: s.destination,
        status: normalizeStatus(s.status),
        vehicle: s.vehicle,
        estimatedDelivery: s.estimated_delivery,
      })),
    }, 'User dashboard retrieved'))
  },

  driver: (req: Request, res: Response) => {
    const db = getDb()
    const user = (req as any).user
    const driver = db.prepare('SELECT id, assigned_vehicle_id FROM drivers WHERE user_id = ? OR id = ? LIMIT 1').get(user.id, user.id) as any
    const currentDriverId = driver?.id ?? user.id
    const shipments = db.prepare('SELECT * FROM shipments WHERE driver = ? OR assigned_driver_id = ? ORDER BY id DESC').all(currentDriverId, currentDriverId) as any[]
    const trips = db.prepare(`SELECT DISTINCT t.* FROM trips t
      LEFT JOIN shipments s ON s.id = t.shipment_id
      WHERE t.driver_id = ? OR s.driver = ? OR s.assigned_driver_id = ? ORDER BY t.id DESC`)
      .all(currentDriverId, currentDriverId, currentDriverId) as any[]
    const currentVehicle = driver?.assigned_vehicle_id
      ?? shipments.find((shipment) => shipment.assigned_vehicle_id || shipment.vehicle !== 'Unassigned')?.assigned_vehicle_id
      ?? shipments.find((shipment) => shipment.vehicle !== 'Unassigned')?.vehicle
      ?? null
    const stats = {
      todayTrips: trips.length,
      assignedRequests: shipments.filter((s) => ['Assigned', 'In Transit'].includes(normalizeStatus(s.status))).length,
      pendingPickups: shipments.filter((s) => normalizeStatus(s.status) === 'Pending').length,
      completedRequests: shipments.filter((s) => normalizeStatus(s.status) === 'Delivered').length,
      currentVehicle,
    }

    const currentTrip = trips[0] || null
    return res.json(buildSuccess({
      stats,
      assignments: shipments.slice(0, 3).map((s) => ({
        id: s.id,
        type: s.type,
        origin: s.origin,
        destination: s.destination,
        weight: s.weight,
        status: normalizeStatus(s.status),
      })),
      currentTrip: currentTrip ? {
        id: currentTrip.id,
        source: currentTrip.source,
        destination: currentTrip.destination,
        distance: currentTrip.distance,
        estimatedTime: currentTrip.estimated_time,
        status: currentTrip.status,
        route: currentTrip.route,
        shipmentId: currentTrip.shipment_id,
      } : null,
    }, 'Driver dashboard retrieved'))
  },

  manager: (_req: Request, res: Response) => {
    const db = getDb()
    const vehicles = db.prepare('SELECT * FROM vehicles').all() as any[]
    const shipments = db.prepare('SELECT * FROM shipments').all() as any[]
    const drivers = db.prepare('SELECT * FROM drivers').all() as any[]
    const trips = db.prepare('SELECT * FROM trips').all() as any[]
    const ai = db.prepare('SELECT * FROM ai_recommendations ORDER BY score DESC LIMIT 4').all() as any[]
    const health = db.prepare('SELECT * FROM service_health').all() as any[]
    const availableCount = vehicles.filter((v) => String(v.status).toLowerCase() === 'available').length
    const inUseCount = vehicles.filter((v) => ['in use', 'on trip'].includes(String(v.status).toLowerCase())).length
    const maintenanceCount = vehicles.filter((v) => String(v.status).toLowerCase() === 'maintenance').length

    const shipmentOverview = [
      { name: 'Pending', value: shipments.filter((s) => normalizeStatus(s.status) === 'Pending').length },
      { name: 'Assigned', value: shipments.filter((s) => normalizeStatus(s.status) === 'Assigned').length },
      { name: 'In Transit', value: shipments.filter((s) => normalizeStatus(s.status) === 'In Transit').length },
      { name: 'Delivered', value: shipments.filter((s) => normalizeStatus(s.status) === 'Delivered').length },
    ]

    return res.json(buildSuccess({
      kpis: {
        totalVehicles: vehicles.length,
        availableVehicles: availableCount,
        activeTrips: trips.filter((t) => ['in progress', 'started', 'in_progress'].includes(String(t.status).toLowerCase())).length,
        activeTransportRequests: shipments.filter((s) => ['Assigned', 'In Transit', 'Delayed'].includes(normalizeStatus(s.status))).length,
        completedRequests: shipments.filter((s) => normalizeStatus(s.status) === 'Delivered').length,
        maintenanceAlerts: vehicles.filter((v) => Number(v.maintenance_risk ?? 0) > 50).length,
        fleetUtilization: vehicles.length === 0 ? 0 : Math.round((inUseCount / vehicles.length) * 100),
        averageFuelEfficiency: Number((vehicles.reduce((sum, vehicle) => sum + Number(vehicle.fuel_efficiency ?? 0), 0) / Math.max(vehicles.length, 1)).toFixed(1)),
      },
      utilizationData: [
        { name: 'Available', value: availableCount },
        { name: 'In Use', value: inUseCount },
        { name: 'Maintenance', value: maintenanceCount },
      ],
      activeTrips: trips.map((trip) => ({
        id: trip.id,
        source: trip.source,
        destination: trip.destination,
        status: trip.status,
      })),
      maintenanceAlerts: vehicles.filter((v) => Number(v.maintenance_risk ?? 0) > 50).map((v) => ({
        id: v.id,
        maintenanceRisk: v.maintenance_risk,
      })),
      aiRecommendations: ai,
      serviceHealth: health,
      shipmentOverview,
      driverCount: drivers.length,
    }, 'Manager dashboard retrieved'))
  },

  fleetAnalytics: (_req: Request, res: Response) => {
    const db = getDb()
    const vehicles = db.prepare('SELECT * FROM vehicles').all() as any[]
    const shipments = db.prepare('SELECT * FROM shipments').all() as any[]

    res.json(buildSuccess({
      totalVehicles: vehicles.length,
      availableVehicles: vehicles.filter((v) => String(v.status).toLowerCase().includes('available')).length,
      activeVehicles: vehicles.filter((v) => String(v.status).toLowerCase().includes('in use') || String(v.status).toLowerCase().includes('on trip')).length,
      maintenanceVehicles: vehicles.filter((v) => String(v.status).toLowerCase().includes('maintenance')).length,
      utilization: Math.min(100, Math.round((vehicles.filter((v) => String(v.status).toLowerCase().includes('in use') || String(v.status).toLowerCase().includes('available')).length / Math.max(vehicles.length, 1)) * 100)),
      activeRequests: shipments.filter((s) => ['Assigned', 'In Transit', 'Delayed'].includes(normalizeStatus(s.status))).length,
    }, 'Fleet analytics retrieved'))
  },

  shipmentAnalytics: (_req: Request, res: Response) => {
    const db = getDb()
    const shipments = db.prepare('SELECT * FROM shipments').all() as any[]
    res.json(buildSuccess({
      totalRequests: shipments.length,
      pending: shipments.filter((s) => normalizeStatus(s.status) === 'Pending').length,
      assigned: shipments.filter((s) => normalizeStatus(s.status) === 'Assigned').length,
      inTransit: shipments.filter((s) => normalizeStatus(s.status) === 'In Transit').length,
      delivered: shipments.filter((s) => normalizeStatus(s.status) === 'Delivered').length,
      cancelled: shipments.filter((s) => normalizeStatus(s.status) === 'Cancelled').length,
      delayed: shipments.filter((s) => normalizeStatus(s.status) === 'Delayed').length,
    }, 'Shipment analytics retrieved'))
  },

  fuelAnalytics: (_req: Request, res: Response) => {
    const db = getDb()
    const vehicles = db.prepare('SELECT * FROM vehicles').all() as any[]
    const averageEfficiency = vehicles.length > 0
      ? vehicles.reduce((sum, vehicle) => sum + Number(vehicle.fuel_efficiency ?? 0), 0) / vehicles.length
      : 0

    res.json(buildSuccess({
      averageEfficiency: Number(averageEfficiency.toFixed(2)),
      totalConsumption: Number((vehicles.reduce((sum, vehicle) => sum + Number(vehicle.mileage ?? 0), 0) * 0.18).toFixed(2)),
      vehicleComparison: vehicles.map((vehicle) => ({
        id: vehicle.id,
        fuelEfficiency: Number(vehicle.fuel_efficiency ?? 0),
        status: vehicle.status,
      })),
    }, 'Fuel analytics retrieved'))
  },

  maintenanceAnalytics: (_req: Request, res: Response) => {
    const db = getDb()
    const records = db.prepare('SELECT * FROM maintenance_records').all() as any[]
    const vehicles = db.prepare('SELECT * FROM vehicles').all() as any[]

    res.json(buildSuccess({
      upcoming: records.filter((record) => String(record.status).toLowerCase() !== 'completed').length,
      highRisk: records.filter((record) => Number(record.risk_score ?? 0) >= 70).length,
      maintenanceCount: records.length,
      maintenanceCost: Number(records.reduce((sum, record) => sum + Number(record.cost ?? 0), 0).toFixed(2)),
      vehiclesNeedingAttention: vehicles.filter((vehicle) => Number(vehicle.maintenance_risk ?? 0) >= 50).length,
    }, 'Maintenance analytics retrieved'))
  },

  driverAnalytics: (_req: Request, res: Response) => {
    const db = getDb()
    const drivers = db.prepare('SELECT * FROM drivers').all() as any[]
    const shipments = db.prepare('SELECT * FROM shipments').all() as any[]

    res.json(buildSuccess({
      totalDrivers: drivers.length,
      availableDrivers: drivers.filter((driver) => String(driver.availability).toLowerCase().includes('available')).length,
      onTripDrivers: drivers.filter((driver) => String(driver.availability).toLowerCase().includes('trip')).length,
      assignedShipments: shipments.filter((shipment) => shipment.driver && shipment.driver !== 'Unassigned').length,
    }, 'Driver analytics retrieved'))
  },
}
