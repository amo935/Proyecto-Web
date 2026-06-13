import type { UserGame, UserGameStatus, EnrichedUserGame } from '~/types/user'

/**
 * Composable para gestionar el repertorio personal del usuario.
 */
export function useMyGames() {
  const api = useApi()

  async function fetchMyGames(): Promise<EnrichedUserGame[]> {
    return await api.fetch<EnrichedUserGame[]>('/my-games')
  }

  async function addToRepertoire(gameId: number, status: UserGameStatus = 'backlog'): Promise<UserGame> {
    return await api.fetch<UserGame>('/my-games', {
      method: 'POST',
      body: { gameId, status }
    })
  }

  async function updateMyGame(id: number, data: {
    status?: UserGameStatus
    personalRating?: number
    hoursPlayed?: number
    notes?: string
  }): Promise<UserGame> {
    return await api.fetch<UserGame>(`/my-games/${id}`, {
      method: 'PATCH',
      body: data
    })
  }

  async function removeFromRepertoire(id: number): Promise<{ success: boolean; message: string }> {
    return await api.fetch<{ success: boolean; message: string }>(`/my-games/${id}`, {
      method: 'DELETE'
    })
  }

  return { fetchMyGames, addToRepertoire, updateMyGame, removeFromRepertoire }
}
