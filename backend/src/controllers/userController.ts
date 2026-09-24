import type { Request, Response } from 'express'
import { getDb } from '../db/database.js'
import { buildSuccess, buildError } from '../utils/response.js'

export const userController = {
  list: (_req: Request, res: Response) => {
    const db = getDb()
    const rows = db.prepare('SELECT id, name, email, phone, role FROM users ORDER BY name').all() as any[]
    return res.json(buildSuccess(rows, 'Users retrieved'))
  },

  getById: (req: Request, res: Response) => {
    const db = getDb()
    const row = db.prepare('SELECT id, name, email, phone, role FROM users WHERE id = ?').get(req.params.id) as any
    if (!row) return res.status(404).json(buildError('User not found'))
    return res.json(buildSuccess(row, 'User retrieved'))
  },
}
