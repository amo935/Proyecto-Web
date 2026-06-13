<script setup lang="ts">
import type { UserGameStatus } from '~/types/user'
import { STATUS_OPTIONS } from '~/constants/game'

/**
 * Página de perfil / repertorio personal del usuario.
 */
definePageMeta({ layout: 'default', middleware: 'auth' })

const { user, logout } = useAuth()
const { fetchMyGames, removeFromRepertoire, updateMyGame } = useMyGames()

const myGames = ref<any[]>([])
const isLoading = ref(true)
const statusFilter = ref<UserGameStatus | 'all'>('all')
const editingId = ref<number | null>(null)
const isUpdating = ref<number | null>(null)
const isRemoving = ref<number | null>(null)

const editForm = reactive({
  status: 'backlog' as UserGameStatus,
  personalRating: undefined as number | undefined,
  hoursPlayed: undefined as number | undefined,
  notes: ''
})

async function loadMyGames() {
  isLoading.value = true
  try {
    myGames.value = await fetchMyGames()
  } catch (err) {
    console.error('Error cargando repertorio:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(loadMyGames)

const filteredGames = computed(() => {
  if (statusFilter.value === 'all') return myGames.value
  return myGames.value.filter((g: any) => g.status === statusFilter.value)
})

const stats = computed(() => {
  const total = myGames.value.length
  const completed = myGames.value.filter((g: any) => g.status === 'completed' || g.status === '100%').length
  const playing = myGames.value.filter((g: any) => g.status === 'playing').length
  const backlog = myGames.value.filter((g: any) => g.status === 'backlog').length
  const dropped = myGames.value.filter((g: any) => g.status === 'dropped').length
  const avgRating = total > 0
    ? Math.round(myGames.value.filter((g: any) => g.personalRating).reduce((sum: number, g: any) => sum + g.personalRating, 0) / myGames.value.filter((g: any) => g.personalRating).length * 10) / 10
    : 0
  return { total, completed, playing, backlog, dropped, avgRating }
})

function startEdit(game: any) {
  editingId.value = game.id
  editForm.status = game.status
  editForm.personalRating = game.personalRating
  editForm.hoursPlayed = game.hoursPlayed
  editForm.notes = game.notes || ''
}

function cancelEdit() {
  editingId.value = null
}

async function saveEdit(gameId: number) {
  isUpdating.value = gameId
  try {
    await updateMyGame(gameId, {
      status: editForm.status,
      personalRating: editForm.personalRating,
      hoursPlayed: editForm.hoursPlayed,
      notes: editForm.notes
    })
    await loadMyGames()
    editingId.value = null
  } catch (err: any) {
    alert('Error al actualizar: ' + (err.statusMessage || err.message))
  } finally {
    isUpdating.value = null
  }
}

async function handleRemove(id: number) {
  if (!confirm('¿Eliminar este juego de tu repertorio?')) return
  isRemoving.value = id
  try {
    await removeFromRepertoire(id)
    await loadMyGames()
  } catch (err: any) {
    alert('Error al eliminar: ' + (err.statusMessage || err.message))
  } finally {
    isRemoving.value = null
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <div>
    <!-- Header Perfil -->
    <div class="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold text-white flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl shadow-lg">
            {{ user?.username?.charAt(0).toUpperCase() }}
          </div>
          {{ user?.username }}
        </h1>
        <p class="text-slate-400 mt-1">{{ user?.email }}</p>
      </div>
      <button @click="logout" class="px-5 py-2.5 bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-300 rounded-xl font-medium transition-colors flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Cerrar sesión
      </button>
    </div>

    <!-- Estadísticas -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
      <div class="glass-card p-4 text-center">
        <div class="text-2xl font-bold text-white">{{ stats.total }}</div>
        <div class="text-xs text-slate-400 mt-1">Total</div>
      </div>
      <div class="glass-card p-4 text-center border-amber-500/20">
        <div class="text-2xl font-bold text-amber-400">{{ stats.playing }}</div>
        <div class="text-xs text-amber-400/70 mt-1">Jugando</div>
      </div>
      <div class="glass-card p-4 text-center border-emerald-500/20">
        <div class="text-2xl font-bold text-emerald-400">{{ stats.completed }}</div>
        <div class="text-xs text-emerald-400/70 mt-1">Completados</div>
      </div>
      <div class="glass-card p-4 text-center border-slate-500/20">
        <div class="text-2xl font-bold text-slate-300">{{ stats.backlog }}</div>
        <div class="text-xs text-slate-400 mt-1">Pendientes</div>
      </div>
      <div class="glass-card p-4 text-center border-rose-500/20">
        <div class="text-2xl font-bold text-rose-400">{{ stats.dropped }}</div>
        <div class="text-xs text-rose-400/70 mt-1">Abandonados</div>
      </div>
      <div class="glass-card p-4 text-center border-indigo-500/20">
        <div class="text-2xl font-bold text-indigo-400">{{ stats.avgRating || '-' }}</div>
        <div class="text-xs text-indigo-400/70 mt-1">Rating medio</div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="flex flex-wrap gap-2 mb-6">
      <button
        @click="statusFilter = 'all'"
        :class="[statusFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700', 'px-4 py-2 rounded-xl text-sm font-medium transition-all']"
      >
        Todos
      </button>
      <button
        v-for="opt in STATUS_OPTIONS"
        :key="opt.value"
        @click="statusFilter = opt.value"
        :class="[statusFilter === opt.value ? opt.color + ' text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700', 'px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2']"
      >
        <span :class="['w-2 h-2 rounded-full', opt.color]"></span>
        {{ opt.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-20">
      <div class="inline-block w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
    </div>

    <!-- Lista vacía -->
    <div v-else-if="filteredGames.length === 0" class="text-center py-16 glass-card">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
      <h3 class="text-xl font-semibold text-slate-300 mb-2">
        {{ statusFilter === 'all' ? 'Tu repertorio está vacío' : 'No hay juegos con este estado' }}
      </h3>
      <p class="text-slate-500 mb-4">Explora el catálogo y añade tus juegos favoritos</p>
      <NuxtLink to="/" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors">
        Explorar catálogo
      </NuxtLink>
    </div>

    <!-- Grid de repertorio -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div v-for="item in filteredGames" :key="item.id" class="glass-card p-4 flex gap-4">
        <NuxtLink :to="`/juego/${item.gameId}`" class="flex-shrink-0 w-24 h-32 rounded-xl overflow-hidden bg-slate-800">
          <img
            v-if="item.game"
            :src="getCoverUrl(item.game.cover)"
            :alt="item.game.title"
            class="w-full h-full object-cover hover:scale-110 transition-transform"
            @error="(e) => { (e.target as HTMLImageElement).src = '/images/games/placeholder.jpg' }"
          >
        </NuxtLink>

        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2 mb-1">
            <NuxtLink :to="`/juego/${item.gameId}`" class="font-bold text-slate-100 hover:text-indigo-400 transition-colors truncate">
              {{ item.game?.title || 'Juego desconocido' }}
            </NuxtLink>
            <StatusBadge :status="item.status" size="sm">{{ item.statusLabel }}</StatusBadge>
          </div>

          <p class="text-xs text-slate-500 mb-2">
            Añadido el {{ formatDate(item.addedAt) }}
            <span v-if="item.completedAt" class="text-emerald-400/80">• Completado el {{ formatDate(item.completedAt) }}</span>
          </p>

          <StarRating v-if="item.personalRating" :rating="item.personalRating" size="sm">
            <template #label>{{ item.personalRating }}/10</template>
          </StarRating>

          <p v-if="item.hoursPlayed" class="text-xs text-indigo-400 mb-2 mt-1">
            {{ item.hoursPlayed }}h jugadas
          </p>

          <p v-if="item.notes" class="text-sm text-slate-400 italic line-clamp-2">"{{ item.notes }}"</p>

          <!-- Modo edición -->
          <div v-if="editingId === item.id" class="mt-3 space-y-3 border-t border-slate-700/50 pt-3">
            <div class="grid grid-cols-2 gap-2">
              <select v-model="editForm.status" class="bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 px-2 py-1.5">
                <option v-for="opt in STATUS_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
              <input v-model.number="editForm.personalRating" type="number" min="1" max="10" placeholder="Rating 1-10" class="bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 px-2 py-1.5">
            </div>
            <input v-model.number="editForm.hoursPlayed" type="number" min="0" step="0.5" placeholder="Horas jugadas" class="w-full bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 px-2 py-1.5">
            <textarea v-model="editForm.notes" rows="2" placeholder="Notas personales..." class="w-full bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 px-2 py-1.5 resize-none"></textarea>
            <div class="flex gap-2">
              <button @click="saveEdit(item.id)" :disabled="isUpdating === item.id" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium">
                {{ isUpdating === item.id ? 'Guardando...' : 'Guardar' }}
              </button>
              <button @click="cancelEdit" class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm">Cancelar</button>
            </div>
          </div>

          <!-- Acciones -->
          <div v-else class="flex gap-2 mt-3">
            <button @click="startEdit(item)" class="px-3 py-1.5 bg-slate-800 hover:bg-amber-600 hover:text-white text-slate-400 rounded-lg text-xs transition-colors">
              Editar
            </button>
            <button @click="handleRemove(item.id)" :disabled="isRemoving === item.id" class="px-3 py-1.5 bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-400 rounded-lg text-xs transition-colors">
              {{ isRemoving === item.id ? '...' : 'Eliminar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
