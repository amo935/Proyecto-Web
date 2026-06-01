import { join } from 'path'
import { readJson, writeJson } from '../utils/jsonStorage.js'
import type { Game } from '../types/index.js'

const DATA_FILE = join(process.cwd(), 'data', 'games.json')

export async function readGames(): Promise<Game[]> {
  return readJson<Game[]>(DATA_FILE)
}

export async function writeGames(games: Game[]): Promise<void> {
  return writeJson(DATA_FILE, games)
}

export async function getGameById(id: number): Promise<Game | null> {
  const games = await readGames()
  return games.find(g => g.id === id) || null
}

export async function deleteGameById(id: number): Promise<boolean> {
  const games = await readGames()
  const index = games.findIndex(g => g.id === id)
  if (index === -1) return false
  games.splice(index, 1)
  await writeGames(games)
  return true
}

export async function generateGameId(): Promise<number> {
  const games = await readGames()
  if (games.length === 0) return 1
  return Math.max(...games.map(g => g.id)) + 1
}
