import type { SortType, Game } from '~/types/game'

export function useGames() {
  const refreshKey = useState<number>('games-refresh-key', () => 0)
  const api = useApi()

  function invalidateCache() {
    refreshKey.value++
  }

  async function fetchGames(options?: { q?: string; sort?: SortType }): Promise<Game[]> {
    const params = new URLSearchParams()
    if (options?.q) params.set('q', options.q)
    if (options?.sort) params.set('sort', options.sort)

    const queryString = params.toString()
    return await api.fetch<Game[]>(`/games${queryString ? `?${queryString}` : ''}`)
  }

  async function createGame(formData: FormData): Promise<Game> {
    const game = await api.fetch<Game>('/games', {
      method: 'POST',
      body: formData
    })
    invalidateCache()
    return game
  }

  async function updateGame(id: number, formData: FormData): Promise<Game> {
    const game = await api.fetch<Game>(`/games/${id}`, {
      method: 'PUT',
      body: formData
    })
    invalidateCache()
    return game
  }

  async function deleteGame(id: number): Promise<{ success: boolean; message: string }> {
    const result = await api.fetch<{ success: boolean; message: string }>(`/games/${id}`, {
      method: 'DELETE'
    })
    invalidateCache()
    return result
  }

  async function fetchGameById(id: number): Promise<Game> {
    return await api.fetch<Game>(`/games/${id}`)
  }

  return {
    refreshKey,
    invalidateCache,
    fetchGames,
    fetchGameById,
    createGame,
    updateGame,
    deleteGame
  }
}
