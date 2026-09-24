import type { NextFunction, Response } from 'express'
import type { AuthRequest } from './auth.js'

export function authorizeRoles(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, data: null, message: 'Authentication required' })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, data: null, message: 'Access denied for this role' })
    }

    return next()
  }
}
