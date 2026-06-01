import bcrypt from 'bcryptjs'
import type { Request, Response } from 'express'

const SESSION_COOKIE = 'gameender_session'
const SALT_ROUNDS = 10

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function setSessionCookie(res: Response, session: { userId: number; username: string }): void {
  const value = Buffer.from(JSON.stringify(session)).toString('base64')
  const isProd = process.env.NODE_ENV === 'production'
  res.cookie(SESSION_COOKIE, value, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7,
    path: '/'
  })
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE, { path: '/' })
}

export function getSession(req: Request): { userId: number; username: string } | null {
  try {
    const raw = req.cookies[SESSION_COOKIE]
    if (!raw) return null
    return JSON.parse(Buffer.from(raw, 'base64').toString('utf-8'))
  } catch {
    return null
  }
}
