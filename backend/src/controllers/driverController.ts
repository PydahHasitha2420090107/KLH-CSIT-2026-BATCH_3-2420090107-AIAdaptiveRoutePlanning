import type { Request, Response } from 'express'
import { getDb } from '../db/database.js'
import { buildError, buildSuccess } from '../utils/response.js'

export const driverController = {
  list: (_req: Request, res: Response) => {
    const db = getDb()
    const rows = db.prepare('SELECT * FROM drivers ORDER BY id').all() as any[]
    return res.json(buildSuccess(rows.map((row) => ({
      id: row.id,
      name: row.name,
      license: row.license,
      availability: row.availability,
      assignedVehicle: row.assigned_vehicle_id || 'Unassigned',
      currentTrip: row.current_trip_id || 'Unassigned',
      status: row.status,
    })), 'Drivers retrieved'))
  },

  getById: (req: Request, res: Response) => {
    const db = getDb()
    const row = db.prepare('SELECT * FROM drivers WHERE id = ?').get(req.params.id) as any
    if (!row) return res.status(404).json(buildError('Driver not found'))

    return res.json(buildSuccess({
      id: row.id,
      name: row.name,
      license: row.license,
      availability: row.availability,
      assignedVehicle: row.assigned_vehicle_id || 'Unassigned',
      currentTrip: row.current_trip_id || 'Unassigned',
      status: row.status,
    }, 'Driver retrieved'))
  },
}
