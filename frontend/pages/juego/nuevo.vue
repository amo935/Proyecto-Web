<script setup lang="ts">
/**
 * Página para añadir un nuevo juego al catálogo.
 * Usa el componente GameForm compartido.
 */
definePageMeta({ layout: 'default', middleware: 'auth' })

const router = useRouter()
const { createGame } = useGames()

const isSubmitting = ref(false)

async function handleSubmit(data: FormData) {
  isSubmitting.value = true
  try {
    await createGame(data)
    alert('¡Juego añadido correctamente!')
    router.push('/')
  } catch (err: any) {
    alert(`Error al guardar: ${err.statusMessage || err.message || 'Error desconocido'}`)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <NuxtLink to="/" class="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors group">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      <span>Volver al catálogo</span>
    </NuxtLink>

    <h1 class="text-3xl font-extrabold mb-8 flex items-center gap-3">
      <span class="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </span>
      Añadir nuevo juego
    </h1>

    <GameForm mode="create" :is-submitting="isSubmitting" @submit="handleSubmit" />
  </div>
</template>
