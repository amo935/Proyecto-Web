<script setup lang="ts">
/**
 * Página para editar un juego existente.
 * Usa el componente GameForm compartido.
 */
definePageMeta({ layout: 'default', middleware: 'auth' })

const router = useRouter()
const route = useRoute()
const { updateGame, fetchGameById } = useGames()

const gameId = Number(route.params.id)

const { data: game, pending, error } = await useAsyncData(`edit-game-${gameId}`, () => fetchGameById(gameId))

const isSubmitting = ref(false)

async function handleSubmit(data: FormData) {
  isSubmitting.value = true
  try {
    await updateGame(gameId, data)
    alert('¡Juego actualizado correctamente!')
    router.push(`/juego/${gameId}`)
  } catch (err: any) {
    alert('Error al actualizar: ' + (err.statusMessage || err.message || 'Error desconocido'))
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <NuxtLink :to="`/juego/${gameId}`" class="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors group">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
      <span>Volver al detalle</span>
    </NuxtLink>

    <div v-if="pending" class="text-center py-20"><div class="inline-block w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div><p class="text-slate-500">Cargando juego...</p></div>
    <div v-else-if="error || !game" class="text-center py-20"><h2 class="text-2xl font-bold text-slate-300 mb-2">Juego no encontrado</h2><NuxtLink to="/" class="text-indigo-400 hover:text-indigo-300">Volver al catálogo</NuxtLink></div>

    <template v-else>
      <h1 class="text-3xl font-extrabold mb-8 flex items-center gap-3">
        <span class="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        </span>
        Editar: {{ game.title }}
      </h1>

      <GameForm mode="edit" :game="game" :is-submitting="isSubmitting" @submit="handleSubmit" />
    </template>
  </div>
</template>
