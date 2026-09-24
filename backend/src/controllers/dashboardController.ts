import type { Request, Response } from 'express'
import { getDb } from '../db/database.js'
import { buildSuccess } from '../utils/response.js'

export const dashboardController = {
  user: (req: Request, res: Response) => {
    const db = getDb()
    const currentUserId = (req as any).user?.id || 'U-1001'
    const shipments = db.prepare('SELECT * FROM shipments WHERE customer_id = ? ORDER BY id DESC').all(currentUserId) as any[]

    const stats = {
      activeTransportRequests: shipments.filter((s) => ['Assigned', 'In Transit', 'Delayed'].includes(s.status)).length,
      completedRequests: shipments.filter((s) => s.status === 'Delivered').length,
      pendingRequests: shipments.filter((s) => s.status === 'Pending').length,
      delayedRequests: shipments.filter((s) => s.status === 'Delayed').length,
    }

    const shipment = shipments[0] || null
    return res.json(buildSuccess({
      stats,
      activeShipment: shipment ? {
        id: shipment.id,
        status: shipment.status,
        currentLocation: shipment.current_location,
        estimatedDelivery: shipment.estimated_delivery,
        progress: shipment.progress,
      } : null,
      recentShipments: shipments.slice(0, 5).map((s) => ({
        id: s.id,
        origin: s.origin,
        destination: s.destination,
        status: s.status,
        vehicle: s.vehicle,
        estimatedDelivery: s.estimated_delivery,
      })),
    }, 'User dashboard retrieved'))
  },

  driver: (req: Request, res: Response) => {
    const db = getDb()
    const currentDriverId = (req as any).user?.id || 'D-2001'
    const shipments = db.prepare('SELECT * FROM shipments WHERE driver = ? ORDER BY id DESC').all(currentDriverId) as any[]
    const trips = db.prepare('SELECT * FROM trips WHERE shipment_id IN (SELECT id FROM shipments WHERE driver = ?) ORDER BY id DESC').all(currentDriverId) as any[]
    const stats = {
      todayTrips: shipments.length,
      assignedRequests: shipments.filter((s) => ['Assigned', 'In Transit'].includes(s.status)).length,
      pendingPickups: shipments.filter((s) => s.status === 'Pending').length,
      completedRequests: shipments.filter((s) => s.status === 'Delivered').length,
      currentVehicle: shipments[0]?.vehicle || 'V-104',
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
        status: s.status,
      })),
      currentTrip: currentTrip ? {
        id: currentTrip.id,
        source: currentTrip.source,
        destination: currentTrip.destination,
        distance: currentTrip.distance,
        estimatedTime: currentTrip.estimated_time,
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

    return res.json(buildSuccess({
      kpis: {
        totalVehicles: vehicles.length,
        availableVehicles: vehicles.filter((v) => v.status === 'Available').length,
        activeTrips: trips.filter((t) => t.status === 'In Progress').length,
        activeTransportRequests: shipments.filter((s) => ['Assigned', 'In Transit', 'Delayed'].includes(s.status)).length,
        completedRequests: shipments.filter((s) => s.status === 'Delivered').length,
        maintenanceAlerts: vehicles.filter((v) => v.maintenance_risk > 50).length,
        fleetUtilization: 76,
        averageFuelEfficiency: 13.8,
      },
      utilizationData: [
        { name: 'Available', value: 58 },
        { name: 'In Use', value: 32 },
        { name: 'Maintenance', value: 10 },
      ],
      activeTrips: trips.map((trip) => ({
        id: trip.id,
        source: trip.source,
        destination: trip.destination,
        status: trip.status,
      })),
      maintenanceAlerts: vehicles.filter((v) => v.maintenance_risk > 50).map((v) => ({
        id: v.id,
        maintenanceRisk: v.maintenance_risk,
      })),
      aiRecommendations: ai,
      serviceHealth: health,
      recentActivity: [
        'Transport request SHP-1001 updated to In Transit',
        'Vehicle V-104 assigned to house shifting request',
        'AI route recommendation approved for Route B',
        'Maintenance inspection scheduled for V-107',
      ],
      shipmentOverview: [
        { name: 'Pending', value: shipments.filter((s) => s.status === 'Pending').length },
        { name: 'Assigned', value: shipments.filter((s) => s.status === 'Assigned').length },
        { name: 'In Transit', value: shipments.filter((s) => s.status === 'In Transit').length },
        { name: 'Delivered', value: shipments.filter((s) => s.status === 'Delivered').length },
      ],
      driverCount: drivers.length,
    }, 'Manager dashboard retrieved'))
  },
}
