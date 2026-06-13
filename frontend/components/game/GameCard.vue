<script setup lang="ts">
import type { Game } from '~/types/game'
import { getTimeColor, formatHours, getMetacriticColor } from '~/constants/game'

interface Props {
  game: Game
  myStatus?: { status: string; statusLabel: string; statusColor: string } | null
  showActions?: boolean
  isDeleting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showActions: false,
  isDeleting: false
})

const emit = defineEmits<{
  (e: 'delete', game: Game): void
}>()
</script>

<template>
  <div
    class="group glass-card overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 relative h-full flex flex-col"
    :class="myStatus ? 'ring-2 ring-indigo-500/20' : ''"
  >
    <!-- Personal status badge -->
    <div v-if="myStatus" class="absolute top-3 left-3 z-20">
      <span :class="`px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 border ${myStatus.statusColor}`">
        {{ myStatus.statusLabel }}
      </span>
    </div>

    <!-- CRUD actions (hover) -->
    <div v-if="showActions" class="absolute top-3 right-3 z-20 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
      <NuxtLink
        :to="`/juego/edit/${game.id}`"
        class="w-8 h-8 rounded-lg bg-slate-900/80 text-slate-300 border border-slate-600 flex items-center justify-center hover:bg-amber-500 hover:text-white transition-colors backdrop-blur-sm"
        title="Editar juego"
        @click.stop
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </NuxtLink>
      <button
        @click="emit('delete', game)"
        :disabled="isDeleting"
        class="w-8 h-8 rounded-lg bg-slate-900/80 text-slate-300 border border-slate-600 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors backdrop-blur-sm"
        title="Eliminar juego"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>

    <NuxtLink :to="`/juego/${game.id}`" class="block flex flex-col flex-grow">
      <div class="relative aspect-[3/4] overflow-hidden bg-slate-800">
        <img
          :src="getCoverUrl(game.cover)"
          :alt="`Portada de ${game.title}`"
          class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
          @error="(e) => { (e.target as HTMLImageElement).src = '/images/games/placeholder.jpg' }"
        >
        <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-80" />
        <div class="absolute top-3 right-3">
          <span
            v-if="game.metacriticScore"
            class="px-2.5 py-1 rounded-lg text-xs font-bold bg-green-600/90 text-white border border-green-500/50 backdrop-blur-sm shadow-lg"
          >
            {{ game.metacriticScore }}
          </span>
        </div>
        <div class="absolute bottom-3 right-3">
          <span :class="`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm ${getTimeColor(game.mainStory)}`">{{ formatHours(game.mainStory) }}</span>
        </div>
        <div class="absolute bottom-3 left-3">
          <span class="px-3 py-1 rounded-full text-xs font-medium bg-slate-900/80 text-slate-300 border border-slate-700/50 backdrop-blur-sm">{{ game.releaseYear }}</span>
        </div>
      </div>
      <div class="p-5 flex flex-col flex-grow">
        <h3 class="font-bold text-lg text-slate-100 mb-2 line-clamp-2 group-hover:text-indigo-400 transition-colors">{{ game.title }}</h3>
        <div class="flex flex-wrap gap-1.5 mb-3">
          <span v-for="genre in game.genres.slice(0, 3)" :key="genre" class="px-2 py-0.5 rounded-md text-xs bg-slate-800 text-slate-400 border border-slate-700/50">{{ genre }}</span>
        </div>
        <div class="space-y-1.5 pt-3 border-t border-slate-700/50 mt-auto">
          <div class="flex justify-between text-sm">
            <span class="text-slate-500">Historia</span>
            <span class="text-emerald-400 font-semibold">{{ formatHours(game.mainStory) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-slate-500">+Extras</span>
            <span class="text-amber-400 font-semibold">{{ formatHours(game.mainPlusExtras) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-slate-500">Completista</span>
            <span class="text-rose-400 font-semibold">{{ formatHours(game.completionist) }}</span>
          </div>
        </div>
      </div>
    </NuxtLink>
  </div>
</template>
