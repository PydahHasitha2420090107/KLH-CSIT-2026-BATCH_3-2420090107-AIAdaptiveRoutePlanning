import type { Request, Response } from 'express'
import { z } from 'zod'
import { getDb } from '../db/database.js'
import { buildError, buildSuccess } from '../utils/response.js'

const vehicleSchema = z.object({
  registrationNumber: z.string().min(1),
  type: z.string().min(1),
  status: z.enum(['Available', 'In Use', 'Maintenance']),
  condition: z.enum(['Excellent', 'Good', 'Fair', 'Poor']),
  mileage: z.number().min(0),
  fuelEfficiency: z.number().min(0),
  maintenanceRisk: z.number().min(0).max(100),
  assignedDriver: z.string().optional(),
  fuelLevel: z.number().min(0).max(100),
  maintenanceDue: z.string().min(1),
})

export const vehicleController = {
  list: (_req: Request, res: Response) => {
    const db = getDb()
    const rows = db.prepare('SELECT * FROM vehicles ORDER BY id').all() as any[]
    return res.json(buildSuccess(rows.map((row) => ({
      id: row.id,
      registrationNumber: row.registration_number,
      type: row.type,
      status: row.status,
      condition: row.condition,
      mileage: row.mileage,
      fuelEfficiency: row.fuel_efficiency,
      maintenanceRisk: row.maintenance_risk,
      assignedDriver: row.assigned_driver_id || 'Unassigned',
      fuelLevel: row.fuel_level,
      maintenanceDue: row.maintenance_due,
    })), 'Vehicles retrieved'))
  },

  getById: (req: Request, res: Response) => {
    const db = getDb()
    const row = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(req.params.id) as any
    if (!row) return res.status(404).json(buildError('Vehicle not found'))

    return res.json(buildSuccess({
      id: row.id,
      registrationNumber: row.registration_number,
      type: row.type,
      status: row.status,
      condition: row.condition,
      mileage: row.mileage,
      fuelEfficiency: row.fuel_efficiency,
      maintenanceRisk: row.maintenance_risk,
      assignedDriver: row.assigned_driver_id || 'Unassigned',
      fuelLevel: row.fuel_level,
      maintenanceDue: row.maintenance_due,
    }, 'Vehicle retrieved'))
  },

  create: (req: Request, res: Response) => {
    const parsed = vehicleSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json(buildError('Invalid vehicle payload'))

    const id = `V-${Date.now()}`
    const db = getDb()
    db.prepare(`INSERT INTO vehicles (id, registration_number, type, status, condition, mileage, fuel_efficiency, maintenance_risk, assigned_driver_id, fuel_level, maintenance_due) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(
        id,
        parsed.data.registrationNumber,
        parsed.data.type,
        parsed.data.status,
        parsed.data.condition,
        parsed.data.mileage,
        parsed.data.fuelEfficiency,
        parsed.data.maintenanceRisk,
        parsed.data.assignedDriver || null,
        parsed.data.fuelLevel,
        parsed.data.maintenanceDue,
      )

    return res.status(201).json(buildSuccess({ id, ...parsed.data }, 'Vehicle created'))
  },

  update: (req: Request, res: Response) => {
    const db = getDb()
    const row = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(req.params.id) as any
    if (!row) return res.status(404).json(buildError('Vehicle not found'))

    const next = { ...row, ...req.body }
    db.prepare(`UPDATE vehicles SET registration_number = ?, type = ?, status = ?, condition = ?, mileage = ?, fuel_efficiency = ?, maintenance_risk = ?, assigned_driver_id = ?, fuel_level = ?, maintenance_due = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .run(
        next.registration_number,
        next.type,
        next.status,
        next.condition,
        next.mileage,
        next.fuel_efficiency,
        next.maintenance_risk,
        next.assigned_driver_id || null,
        next.fuel_level,
        next.maintenance_due,
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
