import type { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { env } from '../config/env.js'
import { getDb } from '../db/database.js'
import { signToken, type AuthRequest } from '../middleware/auth.js'
import { buildError, buildSuccess } from '../utils/response.js'

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().or(z.literal('')),
  password: z.string().min(6),
  role: z.enum(['user', 'driver']).default('user'),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['user', 'driver', 'manager']).optional(),
})

export const authController = {
  register: (req: Request, res: Response) => {
    const parsed = registerSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json(buildError('Invalid registration payload'))
    }

    const db = getDb()
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(parsed.data.email)
    if (existing) {
      return res.status(409).json(buildError('An account with this email already exists'))
    }

    const userId = `${parsed.data.role.toUpperCase()}-${Date.now()}`
    const passwordHash = bcrypt.hashSync(parsed.data.password, 10)
    const createUser = db.transaction(() => {
      db.prepare(`INSERT INTO users (id, name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)`)
        .run(userId, parsed.data.name, parsed.data.email, parsed.data.phone || null, passwordHash, parsed.data.role)
      if (parsed.data.role === 'driver') {
        db.prepare(`INSERT INTO drivers (id, user_id, name, license, availability, status, license_number)
          VALUES (?, ?, ?, ?, ?, ?, ?)`)
          .run(userId, userId, parsed.data.name, 'Not provided', 'Available', 'Active', 'Not provided')
      }
    })
    createUser()

    const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(userId) as any
    const token = signToken({ id: user.id, name: user.name, email: user.email, role: user.role })

    return res.status(201).json({
      success: true,
      data: { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } },
      message: 'Registration successful',
    })
  },

  login: (req: Request, res: Response) => {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json(buildError('Invalid login payload'))
    }

    const db = getDb()
    const row = db.prepare('SELECT * FROM users WHERE email = ?').get(parsed.data.email) as any
    if (!row) {
      return res.status(401).json(buildError('Invalid email or password'))
    }

    const passwordValid = bcrypt.compareSync(parsed.data.password, row.password_hash)
    if (!passwordValid) {
      return res.status(401).json(buildError('Invalid email or password'))
    }

    if (parsed.data.role && row.role !== parsed.data.role) {
      return res.status(401).json(buildError('Role mismatch'))
    }

    const safeUser = { id: row.id, name: row.name, email: row.email, role: row.role }
    const token = signToken({ id: row.id, name: row.name, email: row.email, role: row.role })

    return res.status(200).json(buildSuccess({ token, user: safeUser }, 'Login successful'))
  },

  refresh: (req: Request, res: Response) => {
    const rawToken = typeof req.body?.refreshToken === 'string' ? req.body.refreshToken : undefined

    if (!rawToken) {
      return res.status(400).json(buildError('Refresh token is required'))
    }

    try {
      const decoded = jwt.verify(rawToken, env.jwtSecret) as jwt.JwtPayload & { id?: string }
      if (typeof decoded.id !== 'string') {
        return res.status(401).json(buildError('Invalid refresh token'))
      }

      const db = getDb()
      const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(decoded.id) as AuthRequest['user'] | undefined
      if (!user) return res.status(401).json(buildError('Invalid refresh token'))

      const token = signToken({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      })

      return res.status(200).json(buildSuccess({ token }, 'Token refreshed'))
    } catch {
      return res.status(401).json(buildError('Invalid refresh token'))
    }
  },

  me: (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json(buildError('Authentication required'))
    }

    return res.status(200).json(buildSuccess({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    }))
  },

  logout: (_req: AuthRequest, res: Response) => {
    return res.status(200).json(buildSuccess(null, 'Logout successful'))
  },
}
