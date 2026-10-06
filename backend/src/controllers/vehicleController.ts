import type { Request, Response } from 'express'
import { z } from 'zod'
import { getDb } from '../db/database.js'
import type { AuthRequest, AuthUser } from '../middleware/auth.js'
import { buildError, buildSuccess } from '../utils/response.js'

const vehicleSchema = z.object({
  registrationNumber: z.string().min(1),
  type: z.string().min(1),
  status: z.enum(['Available', 'In Use', 'Maintenance', 'On Trip', 'Inactive']).optional(),
  condition: z.enum(['Excellent', 'Good', 'Fair', 'Poor']).optional(),
  mileage: z.number().min(0).optional(),
  fuelEfficiency: z.number().min(0).optional(),
  maintenanceRisk: z.number().min(0).max(100).optional(),
  assignedDriver: z.string().optional(),
  fuelLevel: z.number().min(0).max(100).optional(),
  maintenanceDue: z.string().min(1).optional(),
  capacity: z.number().min(1).optional(),
  fuelType: z.string().optional(),
})

function formatVehicle(row: any) {
  return {
    id: row.id,
    registrationNumber: row.registration_number ?? row.registrationNumber,
    type: row.type,
    status: row.status,
    condition: row.condition,
    mileage: Number(row.mileage ?? 0),
    fuelEfficiency: Number(row.fuel_efficiency ?? 0),
    maintenanceRisk: Number(row.maintenance_risk ?? 0),
    assignedDriver: row.assigned_driver_id || row.assignedDriver || 'Unassigned',
    fuelLevel: Number(row.fuel_level ?? 0),
    maintenanceDue: row.maintenance_due ?? row.maintenanceDue,
    capacity: Number(row.capacity ?? 1),
    fuelType: row.fuel_type ?? row.fuelType ?? 'diesel',
  }
}

function canAccessVehicle(vehicle: any, user: AuthUser) {
  if (user.role === 'manager') return true
  if (user.role !== 'driver') return false
  const db = getDb()
  const driver = db.prepare('SELECT id FROM drivers WHERE user_id = ? OR id = ? LIMIT 1').get(user.id, user.id) as { id: string } | undefined
  const driverId = driver?.id ?? user.id
  return vehicle.assigned_driver_id === driverId || vehicle.driver_id === driverId
}

function denyVehicleAccess(res: Response) {
  return res.status(403).json(buildError('You are not authorized to access this vehicle'))
}

export const vehicleController = {
  list: (req: Request, res: Response) => {
    if ((req as AuthRequest).user?.role !== 'manager') return denyVehicleAccess(res)
    const db = getDb()
    const rows = db.prepare('SELECT * FROM vehicles ORDER BY id').all() as any[]
    return res.json(buildSuccess(rows.map((row) => formatVehicle(row)), 'Vehicles retrieved'))
  },

  getById: (req: Request, res: Response) => {
    const db = getDb()
    const row = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(req.params.id) as any
    if (!row) return res.status(404).json(buildError('Vehicle not found'))
    if (!canAccessVehicle(row, (req as AuthRequest).user!)) return denyVehicleAccess(res)
    return res.json(buildSuccess(formatVehicle(row), 'Vehicle retrieved'))
  },

  available: (req: Request, res: Response) => {
    if ((req as AuthRequest).user?.role !== 'manager') return denyVehicleAccess(res)
    const db = getDb()
    const rows = db.prepare(`SELECT * FROM vehicles WHERE lower(status) = 'available' ORDER BY id`).all() as any[]
    return res.json(buildSuccess(rows.map((row) => formatVehicle(row)), 'Available vehicles retrieved'))
  },

  maintenance: (req: Request, res: Response) => {
    const db = getDb()
    const row = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(req.params.id) as any
    if (!row) return res.status(404).json(buildError('Vehicle not found'))
    if (!canAccessVehicle(row, (req as AuthRequest).user!)) return denyVehicleAccess(res)

    const records = db.prepare('SELECT * FROM maintenance_records WHERE vehicle_id = ? ORDER BY due_date DESC').all(req.params.id) as any[]
    return res.json(buildSuccess({ vehicle: formatVehicle(row), maintenanceRecords: records }, 'Vehicle maintenance history retrieved'))
  },

  trips: (req: Request, res: Response) => {
    const db = getDb()
    const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(req.params.id) as any
    if (!vehicle) return res.status(404).json(buildError('Vehicle not found'))
    if (!canAccessVehicle(vehicle, (req as AuthRequest).user!)) return denyVehicleAccess(res)
    const trips = db.prepare('SELECT * FROM trips WHERE vehicle_id = ? OR shipment_id IN (SELECT id FROM shipments WHERE vehicle = ?) ORDER BY start_time DESC').all(req.params.id, req.params.id) as any[]
    return res.json(buildSuccess(trips, 'Vehicle trips retrieved'))
  },

  create: (req: Request, res: Response) => {
    const parsed = vehicleSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json(buildError('Invalid vehicle payload'))

    const db = getDb()
    const id = `V-${Date.now()}`
    const status = parsed.data.status ?? 'Available'
    const condition = parsed.data.condition ?? 'Good'
    const mileage = parsed.data.mileage ?? 0
    const efficiency = parsed.data.fuelEfficiency ?? 12
    const risk = parsed.data.maintenanceRisk ?? 25
    const due = parsed.data.maintenanceDue ?? new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10)
    const capacity = parsed.data.capacity ?? 1
    const fuelType = parsed.data.fuelType ?? 'diesel'

    db.prepare(`INSERT INTO vehicles (id, registration_number, type, status, condition, mileage, fuel_efficiency, maintenance_risk, assigned_driver_id, fuel_level, maintenance_due, capacity, fuel_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(
        id,
        parsed.data.registrationNumber,
        parsed.data.type,
        status,
        condition,
        mileage,
        efficiency,
        risk,
        parsed.data.assignedDriver || null,
        100,
        due,
        capacity,
        fuelType,
      )

    return res.status(201).json(buildSuccess({ id, ...parsed.data, status, condition, mileage, fuelEfficiency: efficiency, maintenanceRisk: risk, maintenanceDue: due }, 'Vehicle created'))
  },

  update: (req: Request, res: Response) => {
    const db = getDb()
    const row = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(req.params.id) as any
    if (!row) return res.status(404).json(buildError('Vehicle not found'))

    const next = { ...row, ...req.body }
    db.prepare(`UPDATE vehicles SET registration_number = ?, type = ?, status = ?, condition = ?, mileage = ?, fuel_efficiency = ?, maintenance_risk = ?, assigned_driver_id = ?, fuel_level = ?, maintenance_due = ?, capacity = ?, fuel_type = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .run(
        next.registration_number ?? next.registrationNumber,
        next.type,
        next.status ?? row.status,
        next.condition ?? row.condition,
        next.mileage ?? row.mileage,
        next.fuel_efficiency ?? next.fuelEfficiency ?? row.fuel_efficiency,
        next.maintenance_risk ?? next.maintenanceRisk ?? row.maintenance_risk,
        next.assigned_driver_id ?? next.assignedDriver ?? row.assigned_driver_id,
        next.fuel_level ?? next.fuelLevel ?? row.fuel_level,
        next.maintenance_due ?? next.maintenanceDue ?? row.maintenance_due,
        next.capacity ?? row.capacity ?? 1,
        next.fuel_type ?? next.fuelType ?? row.fuel_type,
        req.params.id,
      )

    return res.json(buildSuccess({ id: req.params.id, ...next }, 'Vehicle updated'))
  },

  remove: (req: Request, res: Response) => {
    const db = getDb()
    const row = db.prepare('DELETE FROM vehicles WHERE id = ?').run(req.params.id)
    if (row.changes === 0) return res.status(404).json(buildError('Vehicle not found'))
    return res.json(buildSuccess(null, 'Vehicle deleted'))
  },
}
