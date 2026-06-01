import { join } from 'path'
import { readJson, writeJson } from '../utils/jsonStorage.js'
import type { UserGame } from '../types/index.js'

const USER_GAMES_FILE = join(process.cwd(), 'data', 'userGames.json')

export async function readUserGames(): Promise<UserGame[]> {
  return readJson<UserGame[]>(USER_GAMES_FILE)
}

export async function writeUserGames(userGames: UserGame[]): Promise<void> {
  return writeJson(USER_GAMES_FILE, userGames)
}

export async function generateUserGameId(): Promise<number> {
  const items = await readUserGames()
  if (items.length === 0) return 1
  return Math.max(...items.map(i => i.id)) + 1
}

export async function findUserGames(userId: number): Promise<UserGame[]> {
  const all = await readUserGames()
  return all.filter(ug => ug.userId === userId)
}

export async function findUserGameById(id: number): Promise<UserGame | null> {
  const all = await readUserGames()
  return all.find(ug => ug.id === id) || null
}

export async function findUserGame(userId: number, gameId: number): Promise<UserGame | null> {
  const all = await readUserGames()
  return all.find(ug => ug.userId === userId && ug.gameId === gameId) || null
}

export async function deleteUserGame(id: number): Promise<boolean> {
  const all = await readUserGames()
  const filtered = all.filter(ug => ug.id !== id)
  if (filtered.length === all.length) return false
  await writeUserGames(filtered)
  return true
}
