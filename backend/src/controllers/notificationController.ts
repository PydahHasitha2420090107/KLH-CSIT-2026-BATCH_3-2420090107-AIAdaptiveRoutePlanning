import type { Request, Response } from 'express'
import { getDb } from '../db/database.js'
import { buildSuccess, buildError } from '../utils/response.js'

export const notificationController = {
  list: (req: Request, res: Response) => {
    const db = getDb()
    const user = (req as any).user
    const rows = db.prepare(
      `SELECT n.id, n.title, n.message, n.type, n.role, n.created_at,
        CASE WHEN n.read = 1 OR EXISTS (
          SELECT 1 FROM notification_reads nr
          WHERE nr.notification_id = n.id AND nr.user_id = ?
        ) THEN 1 ELSE 0 END AS is_read
      FROM notifications n
      WHERE (n.role = ? OR n.role = ?)
        AND (n.user_id IS NULL OR n.user_id = ?)
      ORDER BY n.created_at DESC`,
    ).all(user.id, 'all', user.role, user.id) as any[]

    return res.json(buildSuccess(rows.map((row) => ({
      id: row.id,
      title: row.title,
      message: row.message,
      type: row.type,
      role: row.role,
      read: Boolean(row.is_read),
      createdAt: row.created_at,
    })), 'Notifications retrieved'))
  },

  markRead: (req: Request, res: Response) => {
    const db = getDb()
    const user = (req as any).user
    const row = db.prepare(`SELECT id FROM notifications
      WHERE id = ? AND (role = ? OR role = ?)
        AND (user_id IS NULL OR user_id = ?)`)
      .get(req.params.id, 'all', user.role, user.id)
    if (!row) return res.status(404).json(buildError('Notification not found'))
    db.prepare('INSERT OR IGNORE INTO notification_reads (notification_id, user_id) VALUES (?, ?)').run(req.params.id, user.id)
    return res.json(buildSuccess({ id: req.params.id, read: true }, 'Notification marked as read'))
  },

  readAll: (req: Request, res: Response) => {
    const db = getDb()
    const user = (req as any).user
    const result = db.prepare(`INSERT OR IGNORE INTO notification_reads (notification_id, user_id)
      SELECT id, ? FROM notifications
      WHERE (role = ? OR role = ?) AND (user_id IS NULL OR user_id = ?) AND read = 0`).run(user.id, 'all', user.role, user.id)
    return res.json(buildSuccess({ updated: result.changes }, 'All notifications marked as read'))
  },
}
