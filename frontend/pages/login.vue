<script setup lang="ts">
/**
 * Página de inicio de sesión.
 *
 * Ruta: /login
 * Login con email + password.
 */
definePageMeta({
  layout: 'default',
  middleware: 'guest'
})

const router = useRouter()
const { login } = useAuth()

const isSubmitting = ref(false)
const errorMessage = ref('')

const form = reactive({
  email: '',
  password: ''
})

async function handleSubmit() {
  errorMessage.value = ''
  if (!form.email.trim() || !form.password) {
    errorMessage.value = 'Completa todos los campos'
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errorMessage.value = 'Correo electrónico inválido'
    return
  }

  isSubmitting.value = true
  try {
    await login({
      email: form.email.trim(),
      password: form.password
    })
    router.push('/perfil')
  } catch (err: any) {
    errorMessage.value = err.statusMessage || err.message || 'Error al iniciar sesión'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-[70vh]">
    <div class="w-full max-w-md">
      <div class="glass-card p-8">
        <div class="text-center mb-8">
          <div class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-white">Iniciar sesión</h1>
          <p class="text-slate-400 mt-1">Accede con tu correo electrónico</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Correo electrónico</label>
            <input v-model="form.email" type="email" required placeholder="tu@email.com"
              class="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50">
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Contraseña</label>
            <input v-model="form.password" type="password" required placeholder="••••••••"
              class="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50">
          </div>

          <div v-if="errorMessage" class="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
            {{ errorMessage }}
          </div>

          <button type="submit" :disabled="isSubmitting"
            class="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
            <svg v-if="isSubmitting" class="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isSubmitting ? 'Entrando...' : 'Iniciar sesión' }}
          </button>
        </form>

        <div class="mt-6 text-center text-sm text-slate-400">
          ¿No tienes cuenta?
          <NuxtLink to="/registro" class="text-indigo-400 hover:text-indigo-300 font-medium ml-1">Regístrate</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
