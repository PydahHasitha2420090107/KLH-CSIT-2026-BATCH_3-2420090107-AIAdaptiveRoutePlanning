import type { Request, Response } from 'express'
import { z } from 'zod'
import { getDb } from '../db/database.js'
import type { AuthRequest, AuthUser } from '../middleware/auth.js'
import { buildError, buildSuccess } from '../utils/response.js'

const driverSchema = z.object({
  name: z.string().min(2).optional(),
  license: z.string().min(1).optional(),
  availability: z.enum(['Available', 'On Trip', 'Off Duty']).optional(),
  status: z.enum(['Active', 'Inactive']).optional(),
  userId: z.string().optional(),
})

function formatDriver(row: any) {
  return {
    id: row.id,
    name: row.name,
    license: row.license,
    availability: row.availability,
    assignedVehicle: row.assigned_vehicle_id || row.assignedVehicle || 'Unassigned',
    currentTrip: row.current_trip_id || row.currentTrip || 'Unassigned',
    status: row.status,
    userId: row.user_id,
  }
}

function canAccessDriver(driver: any, user: AuthUser) {
  return user.role === 'manager' || (user.role === 'driver' && (driver.id === user.id || driver.user_id === user.id))
}

function denyDriverAccess(res: Response) {
  return res.status(403).json(buildError('You are not authorized to access this driver'))
}

export const driverController = {
  list: (req: Request, res: Response) => {
    if ((req as AuthRequest).user?.role !== 'manager') return denyDriverAccess(res)
    const db = getDb()
    const rows = db.prepare('SELECT * FROM drivers ORDER BY id').all() as any[]
    return res.json(buildSuccess(rows.map((row) => formatDriver(row)), 'Drivers retrieved'))
  },

  getById: (req: Request, res: Response) => {
    const db = getDb()
    const row = db.prepare('SELECT * FROM drivers WHERE id = ?').get(req.params.id) as any
    if (!row) return res.status(404).json(buildError('Driver not found'))
    if (!canAccessDriver(row, (req as AuthRequest).user!)) return denyDriverAccess(res)
    return res.json(buildSuccess(formatDriver(row), 'Driver retrieved'))
  },

  available: (req: Request, res: Response) => {
    if ((req as AuthRequest).user?.role !== 'manager') return denyDriverAccess(res)
    const db = getDb()
    const rows = db.prepare('SELECT * FROM drivers WHERE availability IN (?, ?, ?) ORDER BY id').all('Available', 'AVAILABLE', 'available') as any[]
    return res.json(buildSuccess(rows.map((row) => formatDriver(row)), 'Available drivers retrieved'))
  },

  shipments: (req: Request, res: Response) => {
    const db = getDb()
    const driver = db.prepare('SELECT * FROM drivers WHERE id = ?').get(req.params.id) as any
    if (!driver) return res.status(404).json(buildError('Driver not found'))
    if (!canAccessDriver(driver, (req as AuthRequest).user!)) return denyDriverAccess(res)
    const rows = db.prepare('SELECT * FROM shipments WHERE driver = ? ORDER BY id DESC').all(driver.id) as any[]
    return res.json(buildSuccess(rows, 'Driver shipments retrieved'))
  },

  trips: (req: Request, res: Response) => {
    const db = getDb()
    const driver = db.prepare('SELECT * FROM drivers WHERE id = ?').get(req.params.id) as any
    if (!driver) return res.status(404).json(buildError('Driver not found'))
    if (!canAccessDriver(driver, (req as AuthRequest).user!)) return denyDriverAccess(res)
    const rows = db.prepare(`SELECT DISTINCT t.* FROM trips t
      LEFT JOIN shipments s ON s.id = t.shipment_id
      WHERE t.driver_id = ? OR s.driver = ? OR s.assigned_driver_id = ? ORDER BY t.id DESC`).all(driver.id, driver.id, driver.id) as any[]
    return res.json(buildSuccess(rows, 'Driver trips retrieved'))
  },

  vehicle: (req: Request, res: Response) => {
    const db = getDb()
    const driver = db.prepare('SELECT * FROM drivers WHERE id = ?').get(req.params.id) as any
    if (!driver) return res.status(404).json(buildError('Driver not found'))
    if (!canAccessDriver(driver, (req as AuthRequest).user!)) return denyDriverAccess(res)
    const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(driver.assigned_vehicle_id || driver.assignedVehicle) as any
    return res.json(buildSuccess(vehicle ? { id: vehicle.id, registrationNumber: vehicle.registration_number, type: vehicle.type, status: vehicle.status } : null, 'Driver vehicle retrieved'))
  },

  create: (req: Request, res: Response) => {
    const parsed = driverSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json(buildError('Invalid driver payload'))

    const db = getDb()
    const id = `D-${Date.now()}`
    const userId = parsed.data.userId ?? id
    const insert = db.prepare('INSERT INTO drivers (id, user_id, name, license, availability, assigned_vehicle_id, current_trip_id, status, license_number, license_expiry) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    insert.run(id, userId, parsed.data.name ?? 'Driver', parsed.data.license ?? 'DL-0000', parsed.data.availability ?? 'Available', null, null, parsed.data.status ?? 'Active', parsed.data.license ?? 'DL-0000', new Date(Date.now() + 86400000 * 365).toISOString().slice(0, 10))

    return res.status(201).json(buildSuccess({ id, ...parsed.data, userId }, 'Driver created'))
  },

  update: (req: Request, res: Response) => {
    const db = getDb()
    const row = db.prepare('SELECT * FROM drivers WHERE id = ?').get(req.params.id) as any
    if (!row) return res.status(404).json(buildError('Driver not found'))

    const next = { ...row, ...req.body }
    db.prepare('UPDATE drivers SET name = ?, license = ?, availability = ?, status = ?, assigned_vehicle_id = ?, current_trip_id = ?, user_id = ? WHERE id = ?')
      .run(next.name, next.license, next.availability ?? row.availability, next.status ?? row.status, next.assigned_vehicle_id ?? next.assignedVehicle ?? row.assigned_vehicle_id, next.current_trip_id ?? next.currentTrip ?? row.current_trip_id, next.user_id ?? row.user_id, req.params.id)

    return res.json(buildSuccess({ id: req.params.id, ...next }, 'Driver updated'))
  },

  remove: (req: Request, res: Response) => {
    const db = getDb()
    const row = db.prepare('DELETE FROM drivers WHERE id = ?').run(req.params.id)
    if (row.changes === 0) return res.status(404).json(buildError('Driver not found'))
    return res.json(buildSuccess(null, 'Driver deleted'))
  },
}
