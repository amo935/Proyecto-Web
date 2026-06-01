import { join } from 'path'
import { readJson, writeJson } from '../utils/jsonStorage.js'
import type { GameReview } from '../types/index.js'

const REVIEWS_FILE = join(process.cwd(), 'data', 'reviews.json')

export async function readReviews(): Promise<GameReview[]> {
  return readJson<GameReview[]>(REVIEWS_FILE)
}

export async function writeReviews(reviews: GameReview[]): Promise<void> {
  return writeJson(REVIEWS_FILE, reviews)
}

export async function generateReviewId(): Promise<number> {
  const items = await readReviews()
  if (items.length === 0) return 1
  return Math.max(...items.map(i => i.id)) + 1
}

export async function findReviewsByGame(gameId: number): Promise<GameReview[]> {
  const all = await readReviews()
  return all.filter(r => r.gameId === gameId)
}

export async function findReviewById(id: number): Promise<GameReview | null> {
  const all = await readReviews()
  return all.find(r => r.id === id) || null
}

export async function findUserReview(userId: number, gameId: number): Promise<GameReview | null> {
  const all = await readReviews()
  return all.find(r => r.userId === userId && r.gameId === gameId) || null
}

export async function deleteReview(id: number): Promise<boolean> {
  const all = await readReviews()
  const filtered = all.filter(r => r.id !== id)
  if (filtered.length === all.length) return false
  await writeReviews(filtered)
  return true
}
