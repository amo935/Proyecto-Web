/**
 * Estado posible de un juego en el repertorio personal del usuario
 */
export type UserGameStatus = 'backlog' | 'playing' | 'completed' | '100%' | 'dropped'

/**
 * Interfaz de usuario
 *
 * - email: Identificador único para login (no público)
 * - username: Alias público visible en navbar y perfil
 */
export interface User {
  id: number
  email: string        // Identificador único de login
  username: string     // Alias público (max 18, solo a-z 0-9 -)
  passwordHash: string
  createdAt: string
}

/**
 * Interfaz para el registro de usuario
 */
export interface UserRegisterInput {
  email: string
  username: string
  password: string
}

/**
 * Interfaz para login
 */
export interface UserLoginInput {
  email: string
  password: string
}

/**
 * Interfaz del repertorio personal (UserGame)
 */
export interface UserGame {
  id: number
  userId: number
  gameId: number
  status: UserGameStatus
  personalRating?: number
  hoursPlayed?: number
  notes?: string
  addedAt: string
  completedAt?: string
}

/**
 * UserGame enriquecido con datos del juego y estilos (devuelto por el backend)
 */
export interface EnrichedUserGame extends UserGame {
  game: import('~/types/game').Game | null
  statusColor: string
  statusLabel: string
}

/**
 * UserGame enriquecido con datos del juego y estilos (devuelto por el backend)
 */
export interface EnrichedUserGame extends UserGame {
  game: import('~/types/game').Game | null
  statusColor: string
  statusLabel: string
}

/**
 * Interfaz para crear entrada en repertorio
 */
export interface UserGameInput {
  gameId: number
  status?: UserGameStatus
  personalRating?: number
  hoursPlayed?: number
  notes?: string
}

/**
 * Versión pública del usuario (sin passwordHash)
 */
export interface PublicUser {
  id: number
  username: string
  email: string
}

/**
 * Sesión activa almacenada en cookie
 */
export interface Session {
  userId: number
  username: string
}
