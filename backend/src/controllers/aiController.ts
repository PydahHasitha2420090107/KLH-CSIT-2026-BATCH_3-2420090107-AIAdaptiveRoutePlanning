import type { Request, Response } from 'express'
import { getDb } from '../db/database.js'
import { buildSuccess } from '../utils/response.js'

export const aiController = {
  recommendations: (_req: Request, res: Response) => {
    const db = getDb()
    const rows = db.prepare('SELECT * FROM ai_recommendations ORDER BY score DESC').all() as any[]
    return res.json(buildSuccess(rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      score: row.score,
      severity: row.severity,
      recommendation: row.recommendation,
      category: row.category,
    })), 'AI recommendations retrieved'))
  },
}
