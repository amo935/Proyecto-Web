export type UserGameStatus = 'backlog' | 'playing' | 'completed' | '100%' | 'dropped'

export interface User {
  id: number
  email: string
  username: string
  passwordHash: string
  createdAt: string
}

export interface UserRegisterInput {
  email: string
  username: string
  password: string
}

export interface UserLoginInput {
  email: string
  password: string
}

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

export interface UserGameInput {
  gameId: number
  status?: UserGameStatus
  personalRating?: number
  hoursPlayed?: number
  notes?: string
}

export interface PublicUser {
  id: number
  username: string
  email: string
}

export interface Session {
  userId: number
  username: string
}

export interface Game {
  id: number
  title: string
  cover: string
  mainStory: number
  mainPlusExtras: number
  completionist: number
  metacriticScore: number
  genres: string[]
  platforms: string[]
  releaseYear: number
  description: string
}

export interface GameInput {
  title: string
  cover: string
  mainStory: number
  mainPlusExtras: number
  completionist: number
  metacriticScore: number
  genres: string[]
  platforms: string[]
  releaseYear: number
  description: string
}

export type SortType = 'time' | 'name' | 'year' | 'metacritic'

export interface GameReview {
  id: number
  userId: number
  gameId: number
  rating: number
  comment: string
  createdAt: string
  updatedAt?: string
}

export interface EnrichedReview extends GameReview {
  user: {
    username: string
  }
}

export interface ReviewInput {
  gameId: number
  rating: number
  comment: string
}

export interface EnrichedUserGame extends UserGame {
  game: Game | null
  statusColor: string
  statusLabel: string
}
