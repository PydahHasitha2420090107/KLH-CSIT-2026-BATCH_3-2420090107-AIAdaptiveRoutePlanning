import type { Request, Response } from 'express'
import { z } from 'zod'
import { getDb } from '../db/database.js'
import { buildError, buildSuccess } from '../utils/response.js'

const tripStatusSchema = z.object({ status: z.enum(['Planned', 'In Progress', 'Completed']) })

export const tripController = {
  list: (_req: Request, res: Response) => {
    const db = getDb()
    const rows = db.prepare('SELECT * FROM trips ORDER BY id').all() as any[]
    return res.json(buildSuccess(rows.map((row) => ({
      id: row.id,
      source: row.source,
      destination: row.destination,
      distance: row.distance,
      estimatedTime: row.estimated_time,
      status: row.status,
      shipmentId: row.shipment_id,
      route: row.route,
    })), 'Trips retrieved'))
  },

  getById: (req: Request, res: Response) => {
    const db = getDb()
    const row = db.prepare('SELECT * FROM trips WHERE id = ?').get(req.params.id) as any
    if (!row) return res.status(404).json(buildError('Trip not found'))
    return res.json(buildSuccess({
      id: row.id,
      source: row.source,
      destination: row.destination,
      distance: row.distance,
      estimatedTime: row.estimated_time,
      status: row.status,
      shipmentId: row.shipment_id,
      route: row.route,
    }, 'Trip retrieved'))
  },

  updateStatus: (req: Request, res: Response) => {
    const parsed = tripStatusSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json(buildError('Invalid trip status payload'))

    const db = getDb()
    const row = db.prepare('SELECT * FROM trips WHERE id = ?').get(req.params.id) as any
    if (!row) return res.status(404).json(buildError('Trip not found'))

    db.prepare('UPDATE trips SET status = ? WHERE id = ?').run(parsed.data.status, req.params.id)
    return res.json(buildSuccess({ id: req.params.id, status: parsed.data.status }, 'Trip status updated'))
  },
}
