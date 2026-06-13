<script setup lang="ts">
import type { Game } from '~/types/game'
import type { UserGameStatus } from '~/types/user'
import type { EnrichedReview } from '~/types/review'
import { STATUS_OPTIONS, STATUS_LABELS, formatHours, getMetacriticColor } from '~/constants/game'

/**
 * Página de detalle - integración con repertorio personal y reviews.
 */
definePageMeta({ layout: 'default' })

const route = useRoute()
const router = useRouter()
const gameId = Number(route.params.id)

const { isLoggedIn, user } = useAuth()
const { deleteGame } = useGames()
const { addToRepertoire, fetchMyGames, removeFromRepertoire } = useMyGames()
const { fetchReviews, createReview, updateReview, deleteReview } = useReviews()

// --- Fetch juego ---
const api = useApi()
const { data: game, pending, error } = await useAsyncData<Game>(
  `game-detail-${gameId}`,
  () => api.fetch(`/games/${gameId}`),
  { server: true }
)

// --- Estado personal ---
const myEntry = ref<any>(null)
const showStatusPicker = ref(false)
const selectedStatus = ref<UserGameStatus>('backlog')
const isAdding = ref(false)
const isRemoving = ref(false)

// --- Estado reviews ---
const reviews = ref<EnrichedReview[]>([])
const reviewsLoading = ref(false)
const reviewForm = reactive({ rating: 8, comment: '' })
const isSubmittingReview = ref(false)
const editingReviewId = ref<number | null>(null)
const editReviewForm = reactive({ rating: 8, comment: '' })
const isUpdatingReview = ref(false)

async function checkRepertoire() {
  if (!isLoggedIn.value) return
  try {
    const games = await fetchMyGames()
    myEntry.value = games.find((g: any) => g.gameId === gameId) || null
  } catch { /* ignore */ }
}

async function loadReviews() {
  reviewsLoading.value = true
  try {
    reviews.value = await fetchReviews(gameId)
  } catch { /* ignore */ } finally { reviewsLoading.value = false }
}

onMounted(() => {
  checkRepertoire()
  loadReviews()
})

async function handleAdd() {
  isAdding.value = true
  try {
    await addToRepertoire(gameId, selectedStatus.value)
    showStatusPicker.value = false
    await checkRepertoire()
  } catch (err: any) {
    if (err.statusCode === 409) await checkRepertoire()
    else alert('Error: ' + (err.statusMessage || err.message))
  } finally { isAdding.value = false }
}

async function handleRemove() {
  if (!myEntry.value) return
  if (!confirm('¿Eliminar este juego de tu repertorio personal?')) return
  isRemoving.value = true
  try {
    await removeFromRepertoire(myEntry.value.id)
    myEntry.value = null
  } catch (err: any) {
    alert('Error: ' + (err.statusMessage || err.message))
  } finally { isRemoving.value = false }
}

// --- Reviews ---
async function handleCreateReview() {
  if (!reviewForm.comment.trim()) { alert('El comentario es obligatorio'); return }
  isSubmittingReview.value = true
  try {
    await createReview(gameId, reviewForm.rating, reviewForm.comment)
    reviewForm.comment = ''
    reviewForm.rating = 8
    await loadReviews()
  } catch (err: any) {
    alert('Error: ' + (err.statusMessage || err.message))
  } finally { isSubmittingReview.value = false }
}

function startEditReview(r: EnrichedReview) {
  editingReviewId.value = r.id
  editReviewForm.rating = r.rating
  editReviewForm.comment = r.comment
}

function cancelEditReview() {
  editingReviewId.value = null
}

async function handleUpdateReview(id: number) {
  isUpdatingReview.value = true
  try {
    await updateReview(id, editReviewForm.rating, editReviewForm.comment)
    editingReviewId.value = null
    await loadReviews()
  } catch (err: any) {
    alert('Error: ' + (err.statusMessage || err.message))
  } finally { isUpdatingReview.value = false }
}

async function handleDeleteReview(id: number) {
  if (!confirm('¿Eliminar tu valoración?')) return
  try {
    await deleteReview(id)
    await loadReviews()
  } catch (err: any) {
    alert('Error: ' + (err.statusMessage || err.message))
  }
}

// --- Acciones globales ---
const isDeleting = ref(false)
async function handleDelete() {
  if (!game.value) return
  if (!confirm(`¿Eliminar permanentemente "${game.value.title}"?`)) return
  isDeleting.value = true
  try { await deleteGame(game.value.id); router.push('/') }
  catch (err: any) { alert('Error: ' + (err.statusMessage || err.message)); isDeleting.value = false }
}

// --- Helpers ---
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <div>
    <!-- Loading -->
    <div v-if="pending" class="text-center py-20">
      <div class="inline-block w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
      <p class="text-slate-500">Cargando detalles...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error || !game" class="text-center py-20">
      <h2 class="text-2xl font-bold text-slate-300 mb-2">Juego no encontrado</h2>
      <NuxtLink to="/" class="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium mt-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Volver al catálogo
      </NuxtLink>
    </div>

    <!-- Detalle -->
    <div v-else class="animate-fade-in">
      <!-- Header con acciones -->
      <div class="flex flex-wrap justify-between items-start gap-4 mb-6">
        <NuxtLink to="/" class="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          <span>Volver a resultados</span>
        </NuxtLink>

        <div class="flex gap-2 flex-wrap items-center">
          <!-- Estado personal (solo logueados) -->
          <template v-if="isLoggedIn">
            <div v-if="myEntry" class="flex items-center gap-2">
              <StatusBadge :status="myEntry.status">
                En repertorio: {{ STATUS_LABELS[myEntry.status] || myEntry.status }}
              </StatusBadge>
              <button @click="handleRemove" :disabled="isRemoving" class="text-xs text-slate-500 hover:text-rose-400 transition-colors">
                {{ isRemoving ? '...' : 'Quitar' }}
              </button>
            </div>
            <div v-else class="relative">
              <button v-if="!showStatusPicker" @click="showStatusPicker = true"
                class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
                Añadir a mi repertorio
              </button>
              <div v-else class="flex flex-wrap gap-1.5">
                <select v-model="selectedStatus" class="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-xl px-2 py-1.5 cursor-pointer">
                  <option v-for="opt in STATUS_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                </select>
                <button @click="handleAdd" :disabled="isAdding" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium">{{ isAdding ? '...' : 'Guardar' }}</button>
                <button @click="showStatusPicker = false" class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl text-sm">Cancelar</button>
              </div>
            </div>
          </template>

          <template v-if="isLoggedIn">
            <NuxtLink :to="`/juego/edit/${game.id}`" class="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              Editar
            </NuxtLink>

            <button @click="handleDelete" :disabled="isDeleting"
              class="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-800 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors">
              <svg v-if="isDeleting" class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Eliminar
            </button>
          </template>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12">
        <div class="lg:col-span-2">
          <div class="glass-card overflow-hidden">
            <div class="aspect-[3/4] relative">
              <img :src="getCoverUrl(game.cover)" :alt="`Portada de ${game.title}`" class="w-full h-full object-cover"
                @error="(e) => { (e.target as HTMLImageElement).src = '/images/games/placeholder.jpg' }">
            </div>
          </div>
        </div>

        <div class="lg:col-span-3">
          <div class="mb-6">
            <div class="flex items-center gap-3 mb-3 flex-wrap">
              <span v-if="game.metacriticScore" :class="`px-3 py-1 rounded-lg text-sm font-bold border ${getMetacriticColor(game.metacriticScore)}`">Metacritic {{ game.metacriticScore }}</span>
              <span class="px-3 py-1 rounded-full text-sm font-medium bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">{{ game.releaseYear }}</span>
              <span class="text-slate-500">•</span>
              <span class="text-slate-400">{{ game.platforms.join(', ') }}</span>
            </div>
            <h1 class="text-3xl sm:text-4xl font-extrabold text-white mb-4">{{ game.title }}</h1>
            <p class="text-slate-400 text-lg leading-relaxed">{{ game.description }}</p>
          </div>

          <div class="flex flex-wrap gap-2 mb-8">
            <span v-for="genre in game.genres" :key="genre" class="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-800 text-slate-300 border border-slate-700">{{ genre }}</span>
          </div>

           <div class="glass-card p-6">
            <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Tiempos de Completitud
            </h2>
            <div class="space-y-6">
              <div>
                <div class="flex justify-between items-center mb-2">
                  <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-emerald-500"></span><span class="font-medium text-slate-200">Historia Principal</span></div>
                  <span class="text-2xl font-bold text-emerald-400">{{ formatHours(game.mainStory) }}</span>
                </div>
                <div class="h-3 bg-slate-800 rounded-full overflow-hidden"><div class="h-full bg-emerald-500 rounded-full transition-all duration-1000" :style="{ width: ((game.mainStory / game.completionist) * 100) + '%' }"></div></div>
              </div>
              <div>
                <div class="flex justify-between items-center mb-2">
                  <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-amber-500"></span><span class="font-medium text-slate-200">Historia + Extras</span></div>
                  <span class="text-2xl font-bold text-amber-400">{{ formatHours(game.mainPlusExtras) }}</span>
                </div>
                <div class="h-3 bg-slate-800 rounded-full overflow-hidden"><div class="h-full bg-amber-500 rounded-full transition-all duration-1000" :style="{ width: ((game.mainPlusExtras / game.completionist) * 100) + '%' }"></div></div>
              </div>
              <div>
                <div class="flex justify-between items-center mb-2">
                  <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-rose-500"></span><span class="font-medium text-slate-200">Completista 100%</span></div>
                  <span class="text-2xl font-bold text-rose-400">{{ formatHours(game.completionist) }}</span>
                </div>
                <div class="h-3 bg-slate-800 rounded-full overflow-hidden"><div class="h-full bg-rose-500 rounded-full"></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Reviews Section -->
      <div class="mt-12">
        <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Valoraciones
          <span v-if="reviews.length" class="text-sm font-normal text-slate-500 ml-2">({{ reviews.length }})</span>
        </h2>

        <!-- Formulario para crear review -->
        <div v-if="isLoggedIn && myEntry" class="glass-card p-6 mb-8">
          <h3 class="text-lg font-semibold text-slate-200 mb-4">Escribe tu valoración</h3>
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <span class="text-sm text-slate-400">Valoración:</span>
              <StarRating :rating="reviewForm.rating" size="lg" interactive @update="reviewForm.rating = $event">
                <template #label>{{ reviewForm.rating }}/10</template>
              </StarRating>
            </div>
            <textarea v-model="reviewForm.comment" rows="3" placeholder="¿Qué te pareció el juego? Comparte tu opinión..."
              class="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"></textarea>
            <div class="flex justify-end">
              <button @click="handleCreateReview" :disabled="isSubmittingReview"
                class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-xl font-semibold transition-colors flex items-center gap-2">
                <svg v-if="isSubmittingReview" class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                {{ isSubmittingReview ? 'Publicando...' : 'Publicar valoración' }}
              </button>
            </div>
          </div>
        </div>

        <div v-else-if="isLoggedIn && !myEntry" class="glass-card p-6 mb-8 text-center">
          <p class="text-slate-400">Añade este juego a tu repertorio para poder valorarlo.</p>
        </div>

        <!-- Lista de reviews -->
        <div v-if="reviewsLoading" class="text-center py-10">
          <div class="inline-block w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>

        <div v-else-if="reviews.length === 0" class="text-center py-12 glass-card">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mx-auto text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <p class="text-slate-400">Aún no hay valoraciones para este juego.</p>
        </div>

        <div v-else class="space-y-4">
          <div v-for="r in reviews" :key="r.id" class="glass-card p-5">
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                  {{ r.user.username.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <div class="font-semibold text-slate-200">{{ r.user.username }}</div>
                  <StarRating :rating="r.rating" size="sm">
                    <template #label>{{ r.rating }}/10</template>
                  </StarRating>
                </div>
              </div>
              <div class="text-xs text-slate-500 flex-shrink-0">
                {{ formatDate(r.createdAt) }}
                <span v-if="r.updatedAt" class="text-slate-600">(editado)</span>
              </div>
            </div>

            <!-- Modo edición -->
            <div v-if="editingReviewId === r.id" class="mt-4 space-y-3">
              <div class="flex items-center gap-2">
                <span class="text-sm text-slate-400">Valoración:</span>
                <StarRating :rating="editReviewForm.rating" size="md" interactive @update="editReviewForm.rating = $event" />
              </div>
              <textarea v-model="editReviewForm.comment" rows="3" class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50"></textarea>
              <div class="flex gap-2">
                <button @click="handleUpdateReview(r.id)" :disabled="isUpdatingReview" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium">
                  {{ isUpdatingReview ? 'Guardando...' : 'Guardar' }}
                </button>
                <button @click="cancelEditReview" class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm">Cancelar</button>
              </div>
            </div>

            <!-- Vista normal -->
            <p v-else class="mt-3 text-slate-300 leading-relaxed">{{ r.comment }}</p>

            <!-- Acciones propias -->
            <div v-if="isLoggedIn && user?.id === r.userId && editingReviewId !== r.id" class="flex gap-3 mt-3">
              <button @click="startEditReview(r)" class="text-xs text-slate-500 hover:text-amber-400 transition-colors">Editar</button>
              <button @click="handleDeleteReview(r.id)" class="text-xs text-slate-500 hover:text-rose-400 transition-colors">Eliminar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
