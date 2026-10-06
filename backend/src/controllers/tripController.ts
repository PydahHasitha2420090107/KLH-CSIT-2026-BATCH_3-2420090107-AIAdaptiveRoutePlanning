import type { Request, Response } from 'express'
import { z } from 'zod'
import { getDb } from '../db/database.js'
import type { AuthRequest, AuthUser } from '../middleware/auth.js'
import { buildError, buildSuccess } from '../utils/response.js'

const tripStatusSchema = z.object({ status: z.enum(['Planned', 'In Progress', 'Completed', 'Started', 'Cancelled']).optional() })

function normalizeTripStatus(status: string | undefined) {
  const value = status?.toString().trim().toUpperCase()
  if (!value) return 'Planned'
  if (['PLANNED', 'PENDING'].includes(value)) return 'Planned'
  if (['STARTED', 'IN_PROGRESS', 'IN PROGRESS'].includes(value)) return 'In Progress'
  if (['COMPLETED', 'DELIVERED'].includes(value)) return 'Completed'
  if (['CANCELLED', 'CANCELED'].includes(value)) return 'Cancelled'
  return status as string
}

function canAccessTrip(trip: any, user: AuthUser) {
  if (user.role === 'manager') return true
  if (user.role !== 'driver') return false

  const db = getDb()
  const driver = db.prepare('SELECT id FROM drivers WHERE user_id = ? OR id = ? LIMIT 1').get(user.id, user.id) as { id: string } | undefined
  const driverId = driver?.id ?? user.id
  if (trip.driver_id === driverId) return true
  const shipment = db.prepare('SELECT driver, assigned_driver_id FROM shipments WHERE id = ?').get(trip.shipment_id) as any
  return shipment?.driver === driverId || shipment?.assigned_driver_id === driverId
}

function denyTripAccess(res: Response) {
  return res.status(403).json(buildError('You are not authorized to access this trip'))
}

function writeTripNotification(db: ReturnType<typeof getDb>, trip: any, title: string, message: string, type: string) {
  const shipment = db.prepare('SELECT customer_id, assigned_driver_id FROM shipments WHERE id = ?').get(trip.shipment_id) as any
  const notify = db.prepare('INSERT OR IGNORE INTO notifications (id, user_id, title, message, type, role) VALUES (?, ?, ?, ?, ?, ?)')
  if (shipment?.customer_id) notify.run(`N-${Date.now()}-CUSTOMER`, shipment.customer_id, title, message, type, 'user')
  if (shipment?.assigned_driver_id) {
    const driver = db.prepare('SELECT user_id FROM drivers WHERE id = ?').get(shipment.assigned_driver_id) as any
    if (driver?.user_id) notify.run(`N-${Date.now()}-DRIVER`, driver.user_id, title, message, type, 'driver')
  }
}

export const tripController = {
  list: (req: Request, res: Response) => {
    const db = getDb()
    const user = (req as AuthRequest).user!
    const rows = user.role === 'manager'
      ? db.prepare('SELECT * FROM trips ORDER BY id').all() as any[]
      : (() => {
          const driver = db.prepare('SELECT id FROM drivers WHERE user_id = ? OR id = ? LIMIT 1').get(user.id, user.id) as { id: string } | undefined
          const driverId = driver?.id ?? user.id
          return db.prepare(`SELECT DISTINCT t.* FROM trips t
            LEFT JOIN shipments s ON s.id = t.shipment_id
            WHERE t.driver_id = ? OR s.driver = ? OR s.assigned_driver_id = ? ORDER BY t.id`)
            .all(driverId, driverId, driverId) as any[]
        })()
    return res.json(buildSuccess(rows.map((row) => ({
      id: row.id,
      source: row.source,
      destination: row.destination,
      distance: row.distance,
      estimatedTime: row.estimated_time,
      status: normalizeTripStatus(row.status),
      shipmentId: row.shipment_id,
      route: row.route,
      driverId: row.driver_id,
      vehicleId: row.vehicle_id,
    })), 'Trips retrieved'))
  },

  getById: (req: Request, res: Response) => {
    const db = getDb()
    const row = db.prepare('SELECT * FROM trips WHERE id = ?').get(req.params.id) as any
    if (!row) return res.status(404).json(buildError('Trip not found'))
    if (!canAccessTrip(row, (req as AuthRequest).user!)) return denyTripAccess(res)
    return res.json(buildSuccess({
      id: row.id,
      source: row.source,
      destination: row.destination,
      distance: row.distance,
      estimatedTime: row.estimated_time,
      status: normalizeTripStatus(row.status),
      shipmentId: row.shipment_id,
      route: row.route,
      driverId: row.driver_id,
      vehicleId: row.vehicle_id,
    }, 'Trip retrieved'))
  },

  create: (req: Request, res: Response) => {
    const db = getDb()
    const shipment = db.prepare('SELECT * FROM shipments WHERE id = ?').get(req.body.shipmentId || req.body.shipment_id) as any
    if (!shipment) return res.status(404).json(buildError('Shipment not found'))

    const driverId = req.body.driverId || req.body.driver_id
    const vehicleId = req.body.vehicleId || req.body.vehicle_id
    if (!driverId || !vehicleId) return res.status(400).json(buildError('Driver and vehicle are required for trip creation'))

    const id = `TRIP-${Date.now()}`
    db.prepare('INSERT INTO trips (id, shipment_id, source, destination, distance, estimated_time, status, route, vehicle_id, driver_id, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id, shipment.id, shipment.origin, shipment.destination, req.body.distance || '0 km', req.body.estimatedTime || req.body.estimated_time || '0h', 'Planned', shipment.route || 'A1 Main Road', vehicleId, driverId, null, null)

    db.prepare('UPDATE shipments SET status = ?, vehicle = ?, driver = ? WHERE id = ?').run('Assigned', vehicleId, driverId, shipment.id)
    return res.status(201).json(buildSuccess({ id, shipmentId: shipment.id, status: 'Planned' }, 'Trip created'))
  },

  update: (req: Request, res: Response) => {
    const db = getDb()
    const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(req.params.id) as any
    if (!trip) return res.status(404).json(buildError('Trip not found'))

    const next = { ...trip, ...req.body }
    db.prepare('UPDATE trips SET source = ?, destination = ?, distance = ?, estimated_time = ?, status = ?, route = ?, vehicle_id = ?, driver_id = ? WHERE id = ?')
      .run(next.source, next.destination, next.distance, next.estimated_time ?? next.estimatedTime ?? trip.estimated_time, normalizeTripStatus(next.status ?? trip.status), next.route ?? trip.route, next.vehicle_id ?? next.vehicleId ?? trip.vehicle_id, next.driver_id ?? next.driverId ?? trip.driver_id, req.params.id)

    return res.json(buildSuccess({ id: req.params.id, ...next }, 'Trip updated'))
  },

  updateStatus: (req: Request, res: Response) => {
    const parsed = tripStatusSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json(buildError('Invalid trip status payload'))

    const db = getDb()
    const row = db.prepare('SELECT * FROM trips WHERE id = ?').get(req.params.id) as any
    if (!row) return res.status(404).json(buildError('Trip not found'))
    if (!canAccessTrip(row, (req as AuthRequest).user!)) return denyTripAccess(res)

    const status = normalizeTripStatus(parsed.data.status)
    db.prepare('UPDATE trips SET status = ? WHERE id = ?').run(status, req.params.id)
    return res.json(buildSuccess({ id: req.params.id, status }, 'Trip status updated'))
  },

  start: (req: Request, res: Response) => {
    const db = getDb()
    const row = db.prepare('SELECT * FROM trips WHERE id = ?').get(req.params.id) as any
    if (!row) return res.status(404).json(buildError('Trip not found'))
    if (!canAccessTrip(row, (req as AuthRequest).user!)) return denyTripAccess(res)
    const startTrip = db.transaction(() => {
      db.prepare('UPDATE trips SET status = ?, start_time = COALESCE(start_time, ?) WHERE id = ?').run('In Progress', new Date().toISOString(), req.params.id)
      db.prepare('UPDATE shipments SET status = ?, progress = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run('In Transit', 20, row.shipment_id)
      writeTripNotification(db, row, 'Trip started', `Trip ${row.id} has started.`, 'info')
    })
    startTrip()
    return res.json(buildSuccess({ id: req.params.id, status: 'In Progress' }, 'Trip started'))
  },

  complete: (req: Request, res: Response) => {
    const db = getDb()
    const row = db.prepare('SELECT * FROM trips WHERE id = ?').get(req.params.id) as any
    if (!row) return res.status(404).json(buildError('Trip not found'))
    if (!canAccessTrip(row, (req as AuthRequest).user!)) return denyTripAccess(res)
    const completeTrip = db.transaction(() => {
      db.prepare('UPDATE trips SET status = ?, end_time = ? WHERE id = ?').run('Completed', new Date().toISOString(), req.params.id)
      db.prepare('UPDATE shipments SET status = ?, progress = 100, current_location = destination, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run('Delivered', row.shipment_id)
      if (row.driver_id) db.prepare('UPDATE drivers SET availability = ?, current_trip_id = NULL WHERE id = ?').run('Available', row.driver_id)
      if (row.vehicle_id) db.prepare('UPDATE vehicles SET status = ?, assigned_driver_id = NULL WHERE id = ?').run('Available', row.vehicle_id)
      writeTripNotification(db, row, 'Delivery completed', `Transport request ${row.shipment_id} has been delivered.`, 'success')
    })
    completeTrip()
    return res.json(buildSuccess({ id: req.params.id, status: 'Completed' }, 'Trip completed'))
  },

  cancel: (req: Request, res: Response) => {
    const db = getDb()
    const row = db.prepare('SELECT * FROM trips WHERE id = ?').get(req.params.id) as any
    if (!row) return res.status(404).json(buildError('Trip not found'))
    if (!canAccessTrip(row, (req as AuthRequest).user!)) return denyTripAccess(res)
    const cancelTrip = db.transaction(() => {
      db.prepare('UPDATE trips SET status = ? WHERE id = ?').run('Cancelled', req.params.id)
      db.prepare('UPDATE shipments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run('Cancelled', row.shipment_id)
      if (row.driver_id) db.prepare('UPDATE drivers SET availability = ?, current_trip_id = NULL WHERE id = ?').run('Available', row.driver_id)
      if (row.vehicle_id) db.prepare('UPDATE vehicles SET status = ?, assigned_driver_id = NULL WHERE id = ?').run('Available', row.vehicle_id)
      writeTripNotification(db, row, 'Trip cancelled', `Trip ${row.id} has been cancelled.`, 'warning')
    })
    cancelTrip()
    return res.json(buildSuccess({ id: req.params.id, status: 'Cancelled' }, 'Trip cancelled'))
  },
}
