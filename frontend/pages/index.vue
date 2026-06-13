<script setup lang="ts">
import type { Game, SortType } from '~/types/game'

/**
 * Página principal - Catálogo público de videojuegos.
 */
definePageMeta({ layout: 'default' })

const { deleteGame, refreshKey } = useGames()
const { isLoggedIn } = useAuth()
const { fetchMyGames } = useMyGames()

const searchQuery = ref('')
const sortBy = ref<SortType>('time')
const isDeleting = ref<number | null>(null)

const myStatusMap = ref<Record<number, { status: string; statusLabel: string; statusColor: string }>>({})

async function loadPersonalStatuses() {
  if (!isLoggedIn.value) return
  try {
    const myGames = await fetchMyGames()
    const map: Record<number, any> = {}
    for (const g of myGames) {
      map[g.gameId] = { status: g.status, statusLabel: g.statusLabel, statusColor: g.statusColor }
    }
    myStatusMap.value = map
  } catch { /* ignore */ }
}

watch(isLoggedIn, loadPersonalStatuses, { immediate: true })

const api = useApi()

const { data: games, pending, error, refresh } = await useAsyncData<Game[]>(
  () => api.fetch('/games', {
    query: { q: searchQuery.value || undefined, sort: sortBy.value }
  }),
  { watch: [searchQuery, sortBy, refreshKey], server: false }
)

const stats = computed(() => {
  if (!games.value) return { total: 0, avgMainStory: 0, longest: 0 }
  const total = games.value.length
  const avgMainStory = total ? Math.round(games.value.reduce((s, g) => s + g.mainStory, 0) / total) : 0
  const longest = total ? Math.max(...games.value.map(g => g.completionist)) : 0
  return { total, avgMainStory, longest }
})

async function handleDelete(game: Game) {
  if (!confirm(`¿Eliminar "${game.title}" permanentemente?`)) return
  isDeleting.value = game.id
  try { await deleteGame(game.id); await refresh() }
  catch (err: any) { alert('Error: ' + (err.statusMessage || err.message)) }
  finally { isDeleting.value = null }
}
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="mb-8 text-center">
      <h1 class="text-4xl sm:text-5xl font-extrabold mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
        ¿Cuánto tardarías?
      </h1>
      <p class="text-slate-400 text-lg max-w-2xl mx-auto mb-6">
        Catálogo público de videojuegos con tiempos de completación. Guarda tus favoritos en tu repertorio personal.
      </p>

      <!-- Stats -->
      <div class="flex flex-wrap justify-center gap-3 mb-6">
        <div class="glass-card px-5 py-2.5"><span class="text-xl font-bold text-white">{{ stats.total }}</span><span class="text-slate-400 ml-2 text-sm">juegos</span></div>
        <div class="glass-card px-5 py-2.5"><span class="text-xl font-bold text-white">{{ stats.avgMainStory }}h</span><span class="text-slate-400 ml-2 text-sm">promedio</span></div>
        <div class="glass-card px-5 py-2.5"><span class="text-xl font-bold text-white">{{ stats.longest }}h</span><span class="text-slate-400 ml-2 text-sm">más largo</span></div>
      </div>

      <!-- Search + Add -->
      <div class="max-w-2xl mx-auto flex gap-3">
        <div class="relative flex-1">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input v-model="searchQuery" type="text" placeholder="Buscar por título o género..."
            class="w-full pl-12 pr-10 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
          <button v-if="searchQuery" @click="searchQuery = ''" class="absolute inset-y-0 right-0 pr-4 text-slate-500 hover:text-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <NuxtLink v-if="isLoggedIn" to="/juego/nuevo" class="flex-shrink-0 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-semibold flex items-center gap-2 shadow-lg shadow-emerald-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
          <span class="hidden sm:inline">Añadir</span>
        </NuxtLink>
      </div>
    </section>

    <!-- Sort -->
    <div class="flex justify-end mb-6">
      <div class="flex items-center gap-2">
        <span class="text-sm text-slate-500">Ordenar:</span>
        <select v-model="sortBy" class="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2 focus:outline-none cursor-pointer">
          <option value="time">Tiempo</option>
          <option value="name">Nombre</option>
          <option value="year">Año</option>
          <option value="metacritic">Metacritic</option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="text-center py-20">
      <div class="inline-block w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
      <p class="text-slate-500">Cargando catálogo...</p>
    </div>

    <div v-else-if="error" class="text-center py-20"><p class="text-rose-400">Error: {{ error.message }}</p></div>

    <!-- Grid -->
    <section v-else>
      <p class="text-slate-500 mb-4 text-sm" v-if="searchQuery">
        {{ games?.length ?? 0 }} resultado(s) para "<span class="text-indigo-400">{{ searchQuery }}</span>"
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <GameCard
          v-for="game in games"
          :key="game.id"
          :game="game"
          :my-status="myStatusMap[game.id]"
          :show-actions="isLoggedIn"
          :is-deleting="isDeleting === game.id"
          @delete="handleDelete"
        />
      </div>

      <!-- Empty state -->
      <div v-if="(!games || games.length === 0) && !pending" class="text-center py-20">
        <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-800/80 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h3 class="text-xl font-semibold text-slate-300 mb-2">No se encontraron juegos</h3>
        <p class="text-slate-500 mb-4">{{ searchQuery ? 'Intenta con otra búsqueda' : 'Comienza añadiendo tu primer juego' }}</p>
        <div class="flex gap-3 justify-center">
          <button v-if="searchQuery" @click="searchQuery = ''" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl">Limpiar búsqueda</button>
          <NuxtLink v-if="isLoggedIn" to="/juego/nuevo" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium">Añadir juego</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
