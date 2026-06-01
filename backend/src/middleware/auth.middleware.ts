import type { Request, Response, NextFunction } from 'express'
import { getSession } from '../services/auth.service.js'

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const session = getSession(req)
  if (!session) {
    res.status(401).json({ error: 'No autenticado' })
    return
  }
  ;(req as any).userSession = session
  next()
}

export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const session = getSession(req)
  if (session) {
    ;(req as any).userSession = session
  }
  next()
}
