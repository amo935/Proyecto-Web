import type { Request, Response, NextFunction } from 'express'
import { hashPassword, verifyPassword, setSessionCookie, clearSessionCookie } from '../services/auth.service.js'
import { readUsers, writeUsers, findUserByEmail, findUserByUsername, findUserById, generateUserId, toPublicUser } from '../services/user.service.js'
import type { User, UserRegisterInput, UserLoginInput } from '../types/index.js'

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body as UserRegisterInput

    if (!body.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      res.status(400).json({ error: 'Correo electrónico inválido' })
      return
    }

    const username = body.username?.trim() || ''
    if (!username) {
      res.status(400).json({ error: 'El alias es obligatorio' })
      return
    }
    if (username.length > 18) {
      res.status(400).json({ error: 'El alias no puede tener más de 18 caracteres' })
      return
    }
    if (!/^[a-zA-Z0-9-]+$/.test(username)) {
      res.status(400).json({ error: 'Solo letras, números y guiones' })
      return
    }

    if (!body.password || body.password.length < 8) {
      res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' })
      return
    }

    const users = await readUsers()

    const existingEmail = users.find(u => u.email.toLowerCase() === body.email.toLowerCase())
    if (existingEmail) {
      res.status(409).json({ error: 'Este correo ya está registrado' })
      return
    }

    const existingUsername = users.find(u => u.username.toLowerCase() === username.toLowerCase())
    if (existingUsername) {
      res.status(409).json({ error: 'Este alias ya está en uso' })
      return
    }

    const user: User = {
      id: await generateUserId(),
      email: body.email.trim().toLowerCase(),
      username: username.toLowerCase(),
      passwordHash: await hashPassword(body.password),
      createdAt: new Date().toISOString()
    }

    users.push(user)
    await writeUsers(users)

    setSessionCookie(res, { userId: user.id, username: user.username })
    res.status(201).json(toPublicUser(user))
  } catch (err) {
    next(err)
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body as UserLoginInput

    if (!body.email?.trim() || !body.password) {
      res.status(400).json({ error: 'Correo y contraseña son obligatorios' })
      return
    }

    const user = await findUserByEmail(body.email.trim())
    if (!user) {
      res.status(401).json({ error: 'Credenciales incorrectas' })
      return
    }

    const valid = await verifyPassword(body.password, user.passwordHash)
    if (!valid) {
      res.status(401).json({ error: 'Credenciales incorrectas' })
      return
    }

    setSessionCookie(res, { userId: user.id, username: user.username })
    res.json(toPublicUser(user))
  } catch (err) {
    next(err)
  }
}

export function logout(_req: Request, res: Response): void {
  clearSessionCookie(res)
  res.json({ success: true, message: 'Sesión cerrada correctamente' })
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const session = (req as any).userSession
    if (!session) {
      res.json(null)
      return
    }

    const user = await findUserById(session.userId)
    if (!user) {
      res.json(null)
      return
    }

    res.json(toPublicUser(user))
  } catch (err) {
    next(err)
  }
}
