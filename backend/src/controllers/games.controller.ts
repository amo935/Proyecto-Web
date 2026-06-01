import type { Request, Response, NextFunction } from 'express'
import { readGames, writeGames, getGameById, deleteGameById, generateGameId } from '../services/game.service.js'
import { readUserGames } from '../services/userGame.service.js'
import { uploadGameCover } from '../services/image.service.js'
import type { Game } from '../types/index.js'

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const searchQuery = ((req.query.q as string) || '').toLowerCase().trim()
    const sortBy = (req.query.sort as string) || 'time'

    let games = await readGames()

    if (searchQuery) {
      games = games.filter(game =>
        game.title.toLowerCase().includes(searchQuery) ||
        game.genres.some(g => g.toLowerCase().includes(searchQuery))
      )
    }

    switch (sortBy) {
      case 'name':
        games = [...games].sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'year':
        games = [...games].sort((a, b) => b.releaseYear - a.releaseYear)
        break
      case 'metacritic':
        games = [...games].sort((a, b) => b.metacriticScore - a.metacriticScore)
        break
      case 'time':
      default:
        games = [...games].sort((a, b) => b.mainStory - a.mainStory)
        break
    }

    res.json(games)
  } catch (err) {
    next(err)
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) {
      res.status(400).json({ error: 'ID inválido' })
      return
    }

    const game = await getGameById(id)
    if (!game) {
      res.status(404).json({ error: 'Juego no encontrado' })
      return
    }

    res.json(game)
  } catch (err) {
    next(err)
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body
    const file = req.file

    const title = (body.title || '').trim()
    if (!title) {
      res.status(400).json({ error: 'El título es obligatorio' })
      return
    }

    let coverUrl = 'placeholder.jpg'
    if (file) {
      const ext = file.originalname.split('.').pop()?.toLowerCase() || 'jpg'
      const safeTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50)
      const filename = `${safeTitle}-${Date.now()}.${ext}`
      coverUrl = await uploadGameCover(file.buffer, filename)
    }

    let genres: string[] = []
    try {
      genres = JSON.parse(body.genres)
    } catch {
      const v = body.genres || ''
      genres = v.split(',').map((g: string) => g.trim()).filter(Boolean)
    }
    if (!genres.length) genres = ['Sin género']

    let platforms: string[] = []
    try {
      platforms = JSON.parse(body.platforms)
    } catch {
      const v = body.platforms || ''
      platforms = v.split(',').map((p: string) => p.trim()).filter(Boolean)
    }
    if (!platforms.length) platforms = ['PC']

    const mainStory = parseFloat(body.mainStory)
    const mainPlusExtras = parseFloat(body.mainPlusExtras)
    const completionist = parseFloat(body.completionist)
    const metacriticScore = parseInt(body.metacriticScore)
    const releaseYear = parseInt(body.releaseYear)

    const newGame: Game = {
      id: await generateGameId(),
      title,
      cover: coverUrl,
      mainStory: isNaN(mainStory) ? 0 : mainStory,
      mainPlusExtras: isNaN(mainPlusExtras) ? 0 : mainPlusExtras,
      completionist: isNaN(completionist) ? 0 : completionist,
      metacriticScore: isNaN(metacriticScore) ? 0 : metacriticScore,
      genres,
      platforms,
      releaseYear: isNaN(releaseYear) ? new Date().getFullYear() : releaseYear,
      description: (body.description || '').trim()
    }

    const games = await readGames()
    games.push(newGame)
    await writeGames(games)

    res.status(201).json(newGame)
  } catch (err) {
    next(err)
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) {
      res.status(400).json({ error: 'ID inválido' })
      return
    }

    const existingGame = await getGameById(id)
    if (!existingGame) {
      res.status(404).json({ error: 'Juego no encontrado' })
      return
    }

    const body = req.body
    const file = req.file

    const title = (body.title || '').trim() || existingGame.title

    let coverUrl = existingGame.cover
    if (file) {
      const ext = file.originalname.split('.').pop()?.toLowerCase() || 'jpg'
      const safeTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50)
      const filename = `${safeTitle}-${Date.now()}.${ext}`
      coverUrl = await uploadGameCover(file.buffer, filename)
    }

    let genres = existingGame.genres
    try {
      genres = JSON.parse(body.genres)
    } catch {
      const v = body.genres || ''
      if (v) genres = v.split(',').map((g: string) => g.trim()).filter(Boolean)
    }

    let platforms = existingGame.platforms
    try {
      platforms = JSON.parse(body.platforms)
    } catch {
      const v = body.platforms || ''
      if (v) platforms = v.split(',').map((p: string) => p.trim()).filter(Boolean)
    }

    const mainStory = parseFloat(body.mainStory)
    const mainPlusExtras = parseFloat(body.mainPlusExtras)
    const completionist = parseFloat(body.completionist)
    const metacriticScore = parseInt(body.metacriticScore)
    const releaseYear = parseInt(body.releaseYear)

    const updatedGame: Game = {
      ...existingGame,
      title,
      cover: coverUrl,
      mainStory: isNaN(mainStory) ? existingGame.mainStory : mainStory,
      mainPlusExtras: isNaN(mainPlusExtras) ? existingGame.mainPlusExtras : mainPlusExtras,
      completionist: isNaN(completionist) ? existingGame.completionist : completionist,
      metacriticScore: isNaN(metacriticScore) ? existingGame.metacriticScore : metacriticScore,
      genres,
      platforms,
      releaseYear: isNaN(releaseYear) ? existingGame.releaseYear : releaseYear,
      description: (body.description || '').trim() !== '' 
        ? (body.description || '').trim() 
        : existingGame.description
    }

    const games = await readGames()
    const index = games.findIndex(g => g.id === id)
    if (index !== -1) {
      games[index] = updatedGame
      await writeGames(games)
    }

    res.json(updatedGame)
  } catch (err) {
    next(err)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) {
      res.status(400).json({ error: 'ID inválido' })
      return
    }

    const game = await getGameById(id)
    if (!game) {
      res.status(404).json({ error: 'Juego no encontrado' })
      return
    }

    // Clean up related userGames
    const userGames = await readUserGames()
    const filteredUserGames = userGames.filter(ug => ug.gameId !== id)
    if (filteredUserGames.length !== userGames.length) {
      const { writeUserGames } = await import('../services/userGame.service.js')
      await writeUserGames(filteredUserGames)
    }

    await deleteGameById(id)

    res.json({ success: true, message: `Juego "${game.title}" eliminado correctamente` })
  } catch (err) {
    next(err)
  }
}
