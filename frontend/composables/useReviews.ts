import type { EnrichedReview, GameReview } from '~/types/review'

export function useReviews() {
  const api = useApi()

  async function fetchReviews(gameId: number): Promise<EnrichedReview[]> {
    return await api.fetch<EnrichedReview[]>(`/reviews?gameId=${gameId}`)
  }

  async function createReview(gameId: number, rating: number, comment: string): Promise<GameReview> {
    return await api.fetch<GameReview>('/reviews', {
      method: 'POST',
      body: { gameId, rating, comment }
    })
  }

  async function updateReview(id: number, rating: number, comment: string): Promise<GameReview> {
    return await api.fetch<GameReview>(`/reviews/${id}`, {
      method: 'PUT',
      body: { rating, comment }
    })
  }

  async function deleteReview(id: number): Promise<{ success: boolean; message: string }> {
    return await api.fetch<{ success: boolean; message: string }>(`/reviews/${id}`, {
      method: 'DELETE'
    })
  }

  return { fetchReviews, createReview, updateReview, deleteReview }
}
