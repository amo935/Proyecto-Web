import type { Request, Response, NextFunction } from 'express'
import { readGames } from '../services/game.service.js'
import {
  readUserGames,
  writeUserGames,
  generateUserGameId,
  findUserGameById,
  findUserGame
} from '../services/userGame.service.js'
import { getGameById } from '../services/game.service.js'
import type { UserGame, UserGameStatus, EnrichedUserGame } from '../types/index.js'

const STATUS_COLORS: Record<UserGameStatus, string> = {
  backlog: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  playing: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  '100%': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  dropped: 'bg-rose-500/20 text-rose-400 border-rose-500/30'
}

const STATUS_LABELS: Record<UserGameStatus, string> = {
  backlog: 'Pendiente',
  playing: 'Jugando',
  completed: 'Completado',
  '100%': 'Completado 100%',
  dropped: 'Abandonado'
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const session = (req as any).userSession

    const [userGames, allGames] = await Promise.all([
      readUserGames().then(all => all.filter(ug => ug.userId === session.userId)),
      readGames()
    ])

    const enriched: EnrichedUserGame[] = userGames.map(ug => {
      const game = allGames.find(g => g.id === ug.gameId) || null
      return {
        ...ug,
        game,
        statusColor: STATUS_COLORS[ug.status] || STATUS_COLORS.backlog,
        statusLabel: STATUS_LABELS[ug.status] || ug.status
      }
    })

    res.json(enriched)
  } catch (err) {
    next(err)
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const session = (req as any).userSession
    const body = req.body

    if (!body.gameId || isNaN(Number(body.gameId))) {
      res.status(400).json({ error: 'ID de juego inválido' })
      return
    }

    const gameId = Number(body.gameId)

    const game = await getGameById(gameId)
    if (!game) {
      res.status(404).json({ error: 'Juego no encontrado en el catálogo' })
      return
    }

    const existing = await findUserGame(session.userId, gameId)
    if (existing) {
      res.status(409).json({ error: 'Este juego ya está en tu repertorio' })
      return
    }

    const validStatuses = ['backlog', 'playing', 'completed', '100%', 'dropped']
    const status = body.status && validStatuses.includes(body.status) ? body.status : 'backlog'

    const userGame: UserGame = {
      id: await generateUserGameId(),
      userId: session.userId,
      gameId,
      status,
      personalRating: body.personalRating && body.personalRating >= 1 && body.personalRating <= 10 ? Number(body.personalRating) : undefined,
      hoursPlayed: body.hoursPlayed && body.hoursPlayed >= 0 ? Number(body.hoursPlayed) : undefined,
      notes: body.notes?.trim() || undefined,
      addedAt: new Date().toISOString(),
      completedAt: status === 'completed' || status === '100%' ? new Date().toISOString() : undefined
    }

    const all = await readUserGames()
    all.push(userGame)
    await writeUserGames(all)

    res.status(201).json(userGame)
  } catch (err) {
    next(err)
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const session = (req as any).userSession
    const id = Number(req.params.id)

    if (isNaN(id)) {
      res.status(400).json({ error: 'ID inválido' })
      return
    }

    const userGame = await findUserGameById(id)
    if (!userGame || userGame.userId !== session.userId) {
      res.status(404).json({ error: 'Entrada no encontrada' })
      return
    }

    const body = req.body
    const validStatuses: UserGameStatus[] = ['backlog', 'playing', 'completed', '100%', 'dropped']

    if (body.status && validStatuses.includes(body.status)) {
      userGame.status = body.status
      if ((body.status === 'completed' || body.status === '100%') && !userGame.completedAt) {
        userGame.completedAt = new Date().toISOString()
      }
    }

    if (body.personalRating !== undefined) {
      const rating = Number(body.personalRating)
      userGame.personalRating = rating >= 1 && rating <= 10 ? rating : undefined
    }

    if (body.hoursPlayed !== undefined) {
      const hours = Number(body.hoursPlayed)
      userGame.hoursPlayed = hours >= 0 ? hours : undefined
    }

    if (body.notes !== undefined) {
      userGame.notes = body.notes.trim() || undefined
    }

    const all = await readUserGames()
    const index = all.findIndex(ug => ug.id === id)
    if (index !== -1) {
      all[index] = userGame
      await writeUserGames(all)
    }

    res.json(userGame)
  } catch (err) {
    next(err)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const session = (req as any).userSession
    const id = Number(req.params.id)

    if (isNaN(id)) {
      res.status(400).json({ error: 'ID inválido' })
      return
    }

    const userGame = await findUserGameById(id)
    if (!userGame || userGame.userId !== session.userId) {
      res.status(404).json({ error: 'Entrada no encontrada' })
      return
    }

    const { deleteUserGame } = await import('../services/userGame.service.js')
    await deleteUserGame(id)

    res.json({ success: true, message: 'Juego eliminado de tu repertorio' })
  } catch (err) {
    next(err)
  }
}
