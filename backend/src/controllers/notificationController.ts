import type { Request, Response } from 'express'
import { getDb } from '../db/database.js'
import { buildSuccess, buildError } from '../utils/response.js'

export const notificationController = {
  list: (req: Request, res: Response) => {
    const db = getDb()
    const user = (req as any).user
    const rows = db.prepare(
      `SELECT * FROM notifications WHERE role = ? OR role = ? OR role = ? ORDER BY created_at DESC`,
    ).all('all', user.role, 'all') as any[]

    return res.json(buildSuccess(rows.map((row) => ({
      id: row.id,
      message: row.message,
      type: row.type,
      role: row.role,
      read: Boolean(row.read),
      createdAt: row.created_at,
    })), 'Notifications retrieved'))
  },

  markRead: (req: Request, res: Response) => {
    const db = getDb()
    const row = db.prepare('UPDATE notifications SET read = 1 WHERE id = ?').run(req.params.id)
    if (row.changes === 0) return res.status(404).json(buildError('Notification not found'))
    return res.json(buildSuccess({ id: req.params.id, read: true }, 'Notification marked as read'))
  },
}
