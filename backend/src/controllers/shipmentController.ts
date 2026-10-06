import type { Request, Response } from 'express'
import { z } from 'zod'
import { getDb } from '../db/database.js'
import type { AuthRequest, AuthUser } from '../middleware/auth.js'
import { buildError, buildSuccess } from '../utils/response.js'

const shipmentStatusSchema = z.object({ status: z.enum(['Pending', 'Assigned', 'In Transit', 'Delayed', 'Delivered']) })

function normalizeStatus(status: string) {
  const value = status?.toString().trim().toUpperCase()
  if (value === 'PENDING' || value === 'REQUESTED') return 'Pending'
  if (value === 'ASSIGNED') return 'Assigned'
  if (value === 'PICKUP_STARTED' || value === 'LOADING' || value === 'IN_TRANSIT' || value === 'NEAR_DESTINATION') return 'In Transit'
  if (value === 'DELIVERED' || value === 'COMPLETED') return 'Delivered'
  if (value === 'DELAYED') return 'Delayed'
  if (value === 'CANCELLED') return 'Cancelled'
  return status || 'Pending'
}

function normalizePriority(priority: string | undefined) {
  const value = priority?.toString().trim().toLowerCase()
  if (value === 'low') return 'Low'
  if (value === 'medium') return 'Medium'
  if (value === 'high') return 'High'
  return priority || 'Medium'
}

function canAccessShipment(shipment: any, user: AuthUser) {
  if (user.role === 'manager') return true
  if (user.role === 'user') return shipment.customer_id === user.id
  const db = getDb()
  const driver = db.prepare('SELECT id FROM drivers WHERE user_id = ? OR id = ? LIMIT 1').get(user.id, user.id) as { id: string } | undefined
  const driverId = driver?.id ?? user.id
  return shipment.driver === driverId || shipment.assigned_driver_id === driverId
}

function denyShipmentAccess(res: Response) {
  return res.status(403).json(buildError('You are not authorized to access this shipment'))
}

export const shipmentController = {
  list: (req: Request, res: Response) => {
    const db = getDb()
    const user = (req as AuthRequest).user!
    let rows: any[]
    if (user.role === 'manager') {
      rows = db.prepare('SELECT * FROM shipments ORDER BY id DESC').all() as any[]
    } else if (user.role === 'driver') {
      const driver = db.prepare('SELECT id FROM drivers WHERE user_id = ? OR id = ? LIMIT 1').get(user.id, user.id) as { id: string } | undefined
      const driverId = driver?.id ?? user.id
      rows = db.prepare('SELECT * FROM shipments WHERE driver = ? OR assigned_driver_id = ? ORDER BY id DESC').all(driverId, driverId) as any[]
    } else {
      rows = db.prepare('SELECT * FROM shipments WHERE customer_id = ? ORDER BY id DESC').all(user.id) as any[]
    }

    return res.json(buildSuccess(rows.map((row) => formatShipment(row)), 'Shipments retrieved'))
  },

  my: (req: Request, res: Response) => {
    const db = getDb()
    const user = (req as AuthRequest).user!
    if (user.role !== 'user') return res.status(403).json(buildError('Only customers can list their own requests'))
    const rows = db.prepare('SELECT * FROM shipments WHERE customer_id = ? ORDER BY created_at DESC').all(user.id) as any[]
    return res.json(buildSuccess(rows.map((row) => formatShipment(row)), 'My shipments retrieved'))
  },

  getById: (req: Request, res: Response) => {
    const db = getDb()
    const row = db.prepare('SELECT * FROM shipments WHERE id = ?').get(req.params.id) as any
    if (!row) return res.status(404).json(buildError('Shipment not found'))

    const user = (req as AuthRequest).user!
    if (!canAccessShipment(row, user)) return denyShipmentAccess(res)

    return res.json(buildSuccess(formatShipment(row), 'Shipment retrieved'))
  },

  create: (req: Request, res: Response) => {
    const user = (req as AuthRequest).user!
    const shipment = {
      ...req.body,
      customer: req.body.customer || user.name,
      customerId: user.id,
      status: 'Pending',
      priority: normalizePriority(req.body.priority || 'Medium'),
      vehicle: 'Unassigned',
      driver: 'Unassigned',
      progress: 0,
    }

    if (!shipment.origin || !shipment.destination || !shipment.type || !shipment.weight) {
      return res.status(400).json(buildError('Missing required shipment fields'))
    }

    const id = `SHP-${Date.now()}`
    const db = getDb()
    db.prepare(`INSERT INTO shipments (id, customer_id, customer, origin, destination, status, vehicle, driver, priority, estimated_delivery, current_location, progress, type, weight, quantity, special_handling, sender_name, sender_contact, receiver_name, receiver_contact, route) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(
        id,
        user.id,
        shipment.customer,
        shipment.origin,
        shipment.destination,
        shipment.status,
        shipment.vehicle,
        shipment.driver,
        shipment.priority,
        shipment.estimatedDelivery || new Date(Date.now() + 86400000).toISOString(),
        shipment.currentLocation || shipment.origin,
        shipment.progress,
        shipment.type,
        shipment.weight,
        shipment.quantity || 1,
        shipment.specialHandling || '',
        shipment.senderName || user.name,
        shipment.senderContact || user.email,
        shipment.receiverName || shipment.destination,
        shipment.receiverContact || '',
        shipment.route || 'A1 Main Road',
      )

    return res.status(201).json(buildSuccess({ id, ...shipment }, 'Shipment created'))
  },

  update: (req: Request, res: Response) => {
    const db = getDb()
    const row = db.prepare('SELECT * FROM shipments WHERE id = ?').get(req.params.id) as any
    if (!row) return res.status(404).json(buildError('Shipment not found'))
    const user = (req as AuthRequest).user!
    if (user.role !== 'manager' && (!canAccessShipment(row, user) || normalizeStatus(row.status) !== 'Pending')) {
      return denyShipmentAccess(res)
    }

    const next = { ...row, ...req.body }
    if (user.role === 'user') {
      next.status = row.status
      next.vehicle = row.vehicle
      next.driver = row.driver
      next.assigned_vehicle_id = row.assigned_vehicle_id
      next.assigned_driver_id = row.assigned_driver_id
      next.current_location = row.current_location
      next.progress = row.progress
    }
    db.prepare(`UPDATE shipments SET origin = ?, destination = ?, status = ?, vehicle = ?, driver = ?, priority = ?, estimated_delivery = ?, current_location = ?, progress = ?, type = ?, weight = ?, quantity = ?, special_handling = ?, sender_name = ?, sender_contact = ?, receiver_name = ?, receiver_contact = ?, route = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .run(
        next.origin,
        next.destination,
        normalizeStatus(next.status ?? row.status),
        next.vehicle ?? row.vehicle,
        next.driver ?? row.driver,
        normalizePriority(next.priority ?? row.priority),
        next.estimated_delivery ?? next.estimatedDelivery ?? row.estimated_delivery,
        next.current_location ?? next.currentLocation ?? row.current_location,
        next.progress ?? row.progress,
        next.type ?? row.type,
        next.weight ?? row.weight,
        next.quantity ?? row.quantity,
        next.special_handling ?? next.specialHandling ?? row.special_handling,
        next.sender_name ?? next.senderName ?? row.sender_name,
        next.sender_contact ?? next.senderContact ?? row.sender_contact,
        next.receiver_name ?? next.receiverName ?? row.receiver_name,
        next.receiver_contact ?? next.receiverContact ?? row.receiver_contact,
        next.route ?? row.route,
        req.params.id,
      )

    return res.json(buildSuccess({ id: req.params.id, ...next }, 'Shipment updated'))
  },

  remove: (req: Request, res: Response) => {
    const db = getDb()
    const shipment = db.prepare('SELECT * FROM shipments WHERE id = ?').get(req.params.id) as any
    if (!shipment) return res.status(404).json(buildError('Shipment not found'))
    const user = (req as AuthRequest).user!
    if (user.role !== 'manager' && (!canAccessShipment(shipment, user) || normalizeStatus(shipment.status) !== 'Pending')) {
      return denyShipmentAccess(res)
    }
    db.prepare('DELETE FROM shipments WHERE id = ?').run(req.params.id)
    return res.json(buildSuccess(null, 'Shipment deleted'))
  },

  tracking: (req: Request, res: Response) => {
    const db = getDb()
    const row = db.prepare('SELECT * FROM shipments WHERE id = ?').get(req.params.id) as any
    if (!row) return res.status(404).json(buildError('Shipment not found'))
    if (!canAccessShipment(row, (req as AuthRequest).user!)) return denyShipmentAccess(res)
    return res.json(buildSuccess({
      id: row.id,
      status: normalizeStatus(row.status),
      currentLocation: row.current_location,
      progress: row.progress,
      estimatedDelivery: row.estimated_delivery,
    }, 'Shipment tracking retrieved'))
  },

  history: (req: Request, res: Response) => {
    const db = getDb()
    const row = db.prepare('SELECT * FROM shipments WHERE id = ?').get(req.params.id) as any
    if (!row) return res.status(404).json(buildError('Shipment not found'))
    if (!canAccessShipment(row, (req as AuthRequest).user!)) return denyShipmentAccess(res)
    return res.json(buildSuccess([formatShipment(row)], 'Shipment history retrieved'))
  },

  assignVehicle: (req: Request, res: Response) => {
    const db = getDb()
    const shipment = db.prepare('SELECT * FROM shipments WHERE id = ?').get(req.params.id) as any
    if (!shipment) return res.status(404).json(buildError('Shipment not found'))
    const user = (req as AuthRequest).user!
    if (user.role !== 'manager') {
      return denyShipmentAccess(res)
    }

    const vehicleId = req.body.vehicleId || req.body.vehicle_id
    const driverId = req.body.driverId || req.body.driver_id

    if (!vehicleId) return res.status(400).json(buildError('Vehicle ID is required'))
    if (!driverId) return res.status(400).json(buildError('Driver ID is required'))

    const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(vehicleId) as any
    if (!vehicle) return res.status(404).json(buildError('Vehicle not found'))
    if (String(vehicle.status).toLowerCase() !== 'available') return res.status(409).json(buildError('Vehicle is not currently available for assignment'))

    const driver = db.prepare('SELECT * FROM drivers WHERE id = ?').get(driverId) as any
    if (!driver) return res.status(404).json(buildError('Driver not found'))
    if (String(driver.availability).toLowerCase().includes('trip')) return res.status(409).json(buildError('Driver has an active conflicting assignment'))

    const assign = db.transaction(() => {
      let trip = db.prepare('SELECT id FROM trips WHERE shipment_id = ? ORDER BY id LIMIT 1').get(shipment.id) as { id: string } | undefined
      if (!trip) {
        const tripId = `TRIP-${Date.now()}`
        db.prepare(`INSERT INTO trips (id, shipment_id, source, destination, distance, estimated_time, status, route, vehicle_id, driver_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
          .run(tripId, shipment.id, shipment.origin, shipment.destination, 'Not calculated', 'Not calculated', 'Planned', shipment.route || 'Route pending', vehicleId, driverId)
        trip = { id: tripId }
      } else {
        db.prepare('UPDATE trips SET vehicle_id = ?, driver_id = ? WHERE id = ?').run(vehicleId, driverId, trip.id)
      }

      db.prepare(`UPDATE shipments SET status = ?, vehicle = ?, driver = ?, assigned_vehicle_id = ?, assigned_driver_id = ?,
        updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run('Assigned', vehicleId, driverId, vehicleId, driverId, shipment.id)
      db.prepare('UPDATE vehicles SET status = ?, assigned_driver_id = ? WHERE id = ?').run('In Use', driverId, vehicleId)
      db.prepare('UPDATE drivers SET assigned_vehicle_id = ?, availability = ?, current_trip_id = ? WHERE id = ?').run(vehicleId, 'On Trip', trip.id, driverId)
      const notify = db.prepare('INSERT OR IGNORE INTO notifications (id, user_id, title, message, type, role) VALUES (?, ?, ?, ?, ?, ?)')
      notify.run(`N-${Date.now()}-CUSTOMER`, shipment.customer_id, 'Transport request assigned', `Your transport request ${shipment.id} has been assigned.`, 'info', 'user')
      notify.run(`N-${Date.now()}-DRIVER`, driver.user_id, 'New transport assignment', `Transport request ${shipment.id} has been assigned to you.`, 'info', 'driver')
      return trip.id
    })
    const tripId = assign()

    return res.json(buildSuccess({ id: req.params.id, tripId, vehicleId, driverId, status: 'Assigned' }, 'Shipment assigned'))
  },

  updateStatus: (req: Request, res: Response) => {
    const parsed = shipmentStatusSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json(buildError('Invalid status payload'))
    }

    const db = getDb()
    const shipment = db.prepare('SELECT * FROM shipments WHERE id = ?').get(req.params.id) as any
    if (!shipment) return res.status(404).json(buildError('Shipment not found'))
    const user = (req as AuthRequest).user!
    if (user.role !== 'manager' && !(user.role === 'driver' && canAccessShipment(shipment, user))) {
      return denyShipmentAccess(res)
    }

    const nextStatus = normalizeStatus(parsed.data.status)
    db.prepare('UPDATE shipments SET status = ?, progress = ?, current_location = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
      nextStatus,
      statusToProgress(nextStatus),
      maybeCurrentLocation(nextStatus, shipment.current_location),
      req.params.id,
    )

    return res.json(buildSuccess({
      id: shipment.id,
      status: nextStatus,
      progress: statusToProgress(nextStatus),
    }, 'Shipment status updated'))
  },
}

function formatShipment(row: any) {
  return {
    id: row.id,
    customer: row.customer,
    origin: row.origin,
    destination: row.destination,
    status: normalizeStatus(row.status),
    vehicle: row.vehicle,
    driver: row.driver,
    priority: row.priority,
    estimatedDelivery: row.estimated_delivery,
    currentLocation: row.current_location,
    progress: row.progress,
    type: row.type,
    weight: row.weight,
    quantity: row.quantity,
    specialHandling: row.special_handling,
    senderName: row.sender_name,
    senderContact: row.sender_contact,
    receiverName: row.receiver_name,
    receiverContact: row.receiver_contact,
    route: row.route,
  }
}

function statusToProgress(status: string) {
  switch (status) {
    case 'Pending': return 0
    case 'Assigned': return 20
    case 'In Transit': return 72
    case 'Delayed': return 55
    case 'Delivered': return 100
    case 'Cancelled': return 0
    default: return 0
  }
}

function maybeCurrentLocation(status: string, current: string) {
  if (status === 'Delivered') return 'Destination reached'
  if (status === 'Delayed') return 'Delayed due to weather risk'
  return current
}
