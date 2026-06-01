import { join } from 'path'
import { readJson, writeJson } from '../utils/jsonStorage.js'
import type { User, PublicUser } from '../types/index.js'

const USERS_FILE = join(process.cwd(), 'data', 'users.json')

export async function readUsers(): Promise<User[]> {
  return readJson<User[]>(USERS_FILE)
}

export async function writeUsers(users: User[]): Promise<void> {
  return writeJson(USERS_FILE, users)
}

export async function generateUserId(): Promise<number> {
  const users = await readUsers()
  if (users.length === 0) return 1
  return Math.max(...users.map(u => u.id)) + 1
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const users = await readUsers()
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null
}

export async function findUserByUsername(username: string): Promise<User | null> {
  const users = await readUsers()
  return users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null
}

export async function findUserById(id: number): Promise<User | null> {
  const users = await readUsers()
  return users.find(u => u.id === id) || null
}

export function toPublicUser(user: User): PublicUser {
  const { passwordHash, ...publicData } = user
  return publicData
}
