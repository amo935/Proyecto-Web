<script setup lang="ts">
import type { Game } from '~/types/game'

interface Props {
  mode: 'create' | 'edit'
  game?: Game | null
  isSubmitting: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'submit', formData: FormData): void
}>()

// --- Estado reactivo (copia para no mutar props) ---
const form = reactive({
  title: props.game?.title ?? '',
  mainStory: props.game?.mainStory ?? 0,
  mainPlusExtras: props.game?.mainPlusExtras ?? 0,
  completionist: props.game?.completionist ?? 0,
  metacriticScore: props.game?.metacriticScore ?? 0,
  genres: props.game?.genres.join(', ') ?? '',
  platforms: props.game?.platforms.join(', ') ?? '',
  releaseYear: props.game?.releaseYear ?? new Date().getFullYear(),
  description: props.game?.description ?? ''
})

// Si recibimos un juego nuevo en modo edit, sincronizar
watch(() => props.game, (g) => {
  if (g && props.mode === 'edit') {
    form.title = g.title
    form.mainStory = g.mainStory
    form.mainPlusExtras = g.mainPlusExtras
    form.completionist = g.completionist
    form.metacriticScore = g.metacriticScore || 0
    form.genres = g.genres.join(', ')
    form.platforms = g.platforms.join(', ')
    form.releaseYear = g.releaseYear
    form.description = g.description
  }
}, { immediate: true })

const previewUrl = ref<string | null>(null)
const coverFile = ref<File | null>(null)

function handleFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.[0]) {
    coverFile.value = input.files[0]
    previewUrl.value = URL.createObjectURL(input.files[0])
  }
}

function removeFile() {
  coverFile.value = null
  previewUrl.value = null
}

function handleSubmit() {
  if (!form.title.trim()) {
    alert('El título es obligatorio')
    return
  }

  const data = new FormData()
  data.append('title', form.title)
  data.append('mainStory', String(form.mainStory))
  data.append('mainPlusExtras', String(form.mainPlusExtras))
  data.append('completionist', String(form.completionist))
  data.append('metacriticScore', String(form.metacriticScore))
  data.append('genres', JSON.stringify(form.genres.split(',').map(g => g.trim()).filter(Boolean)))
  data.append('platforms', JSON.stringify(form.platforms.split(',').map(p => p.trim()).filter(Boolean)))
  data.append('releaseYear', String(form.releaseYear))
  data.append('description', form.description)

  if (coverFile.value) {
    data.append('cover', coverFile.value)
  }

  emit('submit', data)
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="glass-card p-8 space-y-6">
    <!-- Imagen de portada -->
    <div>
      <label class="block text-sm font-medium text-slate-300 mb-3">Portada del juego</label>
      <div class="flex items-start gap-6">
        <div class="w-40 h-56 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 flex-shrink-0">
          <img v-if="previewUrl" :src="previewUrl" class="w-full h-full object-cover" alt="Preview">
          <img v-else-if="mode === 'edit' && game?.cover" :src="getCoverUrl(game.cover)" class="w-full h-full object-cover" :alt="game.title">
          <div v-else class="w-full h-full flex flex-col items-center justify-center text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span class="text-xs">Sin imagen</span>
          </div>
        </div>
        <div class="flex-1">
          <input
            type="file"
            accept="image/*"
            @change="handleFileChange"
            class="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
          >
          <p class="mt-2 text-xs text-slate-500">Formatos: JPG, PNG, WEBP, GIF. Máx. 5MB recomendado.</p>
          <button v-if="previewUrl" type="button" @click="removeFile" class="mt-2 text-sm text-rose-400 hover:text-rose-300">
            {{ mode === 'edit' ? 'Cancelar cambio de imagen' : 'Eliminar imagen' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Título -->
    <div>
      <label class="block text-sm font-medium text-slate-300 mb-2">Título *</label>
      <input
        v-model="form.title"
        type="text"
        required
        placeholder="Ej: The Witcher 3"
        class="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
      >
    </div>

    <!-- Tiempos + Metacritic -->
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <div>
        <label class="block text-sm font-medium text-slate-300 mb-2">Historia Principal (h) *</label>
        <input v-model.number="form.mainStory" type="number" min="0" step="0.5" required class="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-300 mb-2">+ Extras (h)</label>
        <input v-model.number="form.mainPlusExtras" type="number" min="0" step="0.5" class="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-300 mb-2">Completista (h)</label>
        <input v-model.number="form.completionist" type="number" min="0" step="0.5" class="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-300 mb-2">Metacritic (0-100)</label>
        <input v-model.number="form.metacriticScore" type="number" min="0" max="100" class="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
      </div>
    </div>

    <!-- Géneros y Plataformas -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-slate-300 mb-2">Géneros (separados por comas)</label>
        <input v-model="form.genres" type="text" placeholder="RPG, Acción, Aventura" class="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-300 mb-2">Plataformas (separadas por comas)</label>
        <input v-model="form.platforms" type="text" placeholder="PC, PS5, Xbox" class="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
      </div>
    </div>

    <!-- Año y Descripción -->
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <div class="sm:col-span-1">
        <label class="block text-sm font-medium text-slate-300 mb-2">Año de lanzamiento</label>
        <input v-model.number="form.releaseYear" type="number" min="1970" :max="new Date().getFullYear() + 1" class="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
      </div>
      <div class="sm:col-span-3">
        <label class="block text-sm font-medium text-slate-300 mb-2">Descripción</label>
        <textarea v-model="form.description" rows="3" placeholder="Breve descripción del juego..." class="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"></textarea>
      </div>
    </div>

    <!-- Botones -->
    <div class="flex gap-4 pt-4 border-t border-slate-700/50">
      <button
        type="submit"
        :disabled="isSubmitting"
        class="flex-1 py-3 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
      >
        <svg v-if="isSubmitting" class="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {{ isSubmitting ? 'Guardando...' : (mode === 'create' ? 'Guardar juego' : 'Actualizar juego') }}
      </button>
      <NuxtLink :to="mode === 'create' ? '/' : `/juego/${game?.id}`" class="py-3 px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-colors">
        Cancelar
      </NuxtLink>
    </div>
  </form>
</template>
