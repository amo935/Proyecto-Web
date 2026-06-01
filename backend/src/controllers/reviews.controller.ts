import type { Request, Response, NextFunction } from 'express'
import { readUsers } from '../services/user.service.js'
import {
  readReviews,
  writeReviews,
  generateReviewId,
  findReviewById,
  findUserReview,
  deleteReview
} from '../services/review.service.js'
import { readUserGames } from '../services/userGame.service.js'
import type { GameReview, EnrichedReview } from '../types/index.js'

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const gameId = Number(req.query.gameId)

    if (!gameId || isNaN(gameId)) {
      res.status(400).json({ error: 'gameId es obligatorio' })
      return
    }

    const [reviews, users] = await Promise.all([
      readReviews(),
      readUsers()
    ])

    const gameReviews = reviews
      .filter(r => r.gameId === gameId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const enriched: EnrichedReview[] = gameReviews.map(r => {
      const user = users.find(u => u.id === r.userId)
      return {
        ...r,
        user: { username: user?.username || 'Usuario' }
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

    const rating = Number(body.rating)
    if (!rating || rating < 1 || rating > 10) {
      res.status(400).json({ error: 'La valoración debe estar entre 1 y 10' })
      return
    }

    if (!body.comment?.trim()) {
      res.status(400).json({ error: 'El comentario es obligatorio' })
      return
    }

    const gameId = Number(body.gameId)

    const userGames = await readUserGames()
    const inRepertoire = userGames.find(ug => ug.userId === session.userId && ug.gameId === gameId)
    if (!inRepertoire) {
      res.status(403).json({ error: 'Debes tener el juego en tu repertorio para valorarlo' })
      return
    }

    const existing = await findUserReview(session.userId, gameId)
    if (existing) {
      res.status(409).json({ error: 'Ya has valorado este juego. Edita tu review existente.' })
      return
    }

    const review: GameReview = {
      id: await generateReviewId(),
      userId: session.userId,
      gameId,
      rating,
      comment: body.comment.trim(),
      createdAt: new Date().toISOString()
    }

    const all = await readReviews()
    all.push(review)
    await writeReviews(all)

    res.status(201).json(review)
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

    const review = await findReviewById(id)
    if (!review) {
      res.status(404).json({ error: 'Review no encontrada' })
      return
    }
    if (review.userId !== session.userId) {
      res.status(403).json({ error: 'No puedes editar una review de otro usuario' })
      return
    }

    const body = req.body

    if (body.rating !== undefined) {
      const newRating = Number(body.rating)
      if (newRating < 1 || newRating > 10) {
        res.status(400).json({ error: 'La valoración debe estar entre 1 y 10' })
        return
      }
      review.rating = newRating
    }

    if (body.comment !== undefined) {
      const comment = body.comment.trim()
      if (!comment) {
        res.status(400).json({ error: 'El comentario no puede estar vacío' })
        return
      }
      review.comment = comment
    }

    review.updatedAt = new Date().toISOString()

    const all = await readReviews()
    const index = all.findIndex(r => r.id === id)
    if (index !== -1) {
      all[index] = review
      await writeReviews(all)
    }

    res.json(review)
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

    const review = await findReviewById(id)
    if (!review) {
      res.status(404).json({ error: 'Review no encontrada' })
      return
    }
    if (review.userId !== session.userId) {
      res.status(403).json({ error: 'No puedes eliminar una review de otro usuario' })
      return
    }

    await deleteReview(id)

    res.json({ success: true, message: 'Review eliminada correctamente' })
  } catch (err) {
    next(err)
  }
}
