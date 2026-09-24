import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { getDb } from '../db/database.js'

export interface AuthUser {
  id: string
  email: string
  role: 'user' | 'driver' | 'manager'
  name: string
}

export interface AuthRequest extends Request {
  user?: AuthUser
}

export function signToken(user: AuthUser) {
  return jwt.sign(user, env.jwtSecret, { expiresIn: env.jwtExpiresIn as any })
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, data: null, message: 'Authentication required' })
  }

  const token = header.replace('Bearer ', '')

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as AuthUser
    const db = getDb()
    const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(decoded.id) as any

    if (!user) {
      return res.status(401).json({ success: false, data: null, message: 'User not found' })
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    }
    return next()
  } catch {
    return res.status(401).json({ success: false, data: null, message: 'Invalid or expired token' })
  }
}
