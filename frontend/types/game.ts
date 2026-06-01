/**
 * Interfaz que define la estructura de un videojuego en el catálogo global.
 *
 * El estado de completado ES PERSONAL y vive en el repertorio del usuario (UserGame),
 * NO en esta entidad global.
 */
export interface Game {
  id: number
  title: string
  cover: string
  mainStory: number
  mainPlusExtras: number
  completionist: number
  metacriticScore: number  // Puntuación Metacritic (promedio plataformas, 0-100)
  genres: string[]
  platforms: string[]
  releaseYear: number
  description: string
}

/**
 * Interfaz para crear/editar un juego (sin ID, se genera automáticamente)
 */
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
