/**
 * Interfaz de review/valoración de un juego por un usuario
 */
export interface GameReview {
  id: number
  userId: number
  gameId: number
  rating: number       // 1-10
  comment: string
  createdAt: string
  updatedAt?: string
}

/**
 * Review enriquecida con datos del usuario para mostrar en frontend
 */
export interface EnrichedReview extends GameReview {
  user: {
    username: string
  }
}

/**
 * Input para crear/editar una review
 */
export interface ReviewInput {
  gameId: number
  rating: number
  comment: string
}
