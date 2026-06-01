<script setup lang="ts">
/**
 * Página de registro de usuarios.
 *
 * Ruta: /registro
 * Registro con email + username(alias público) + password.
 */
definePageMeta({ layout: 'default', middleware: 'guest' })

const router = useRouter()
const { register } = useAuth()

const isSubmitting = ref(false)
const errorMessage = ref('')
const usernameError = ref('')

const form = reactive({
  email: '',
  username: '',
  password: '',
  confirmPassword: ''
})

// Validación en tiempo real del username
watch(() => form.username, (val) => {
  usernameError.value = ''
  if (!val) return
  if (val.length > 18) usernameError.value = 'Máximo 18 caracteres'
  else if (!/^[a-zA-Z0-9-]+$/.test(val)) usernameError.value = 'Solo letras, números y guiones'
})

async function handleSubmit() {
  errorMessage.value = ''
  usernameError.value = ''

  if (!form.email.trim() || !form.username.trim() || !form.password) {
    errorMessage.value = 'Completa todos los campos'
    return
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errorMessage.value = 'Correo electrónico inválido'
    return
  }

  if (form.username.length > 18) {
    usernameError.value = 'El alias no puede tener más de 18 caracteres'
    return
  }

  if (!/^[a-zA-Z0-9-]+$/.test(form.username.trim())) {
    usernameError.value = 'Solo letras, números y guiones'
    return
  }

  if (form.password.length < 8) {
    errorMessage.value = 'La contraseña debe tener al menos 8 caracteres'
    return
  }

  if (form.password !== form.confirmPassword) {
    errorMessage.value = 'Las contraseñas no coinciden'
    return
  }

  isSubmitting.value = true
  try {
    await register({
      email: form.email.trim(),
      username: form.username.trim(),
      password: form.password
    })
    router.push('/perfil')
  } catch (err: any) {
    errorMessage.value = err.statusMessage || err.message || 'Error al registrarse'
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
          <div class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-white">Crear cuenta</h1>
          <p class="text-slate-400 mt-1">Únete a GameEnder y crea tu repertorio</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Correo electrónico</label>
            <input v-model="form.email" type="email" required placeholder="tu@email.com"
              class="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50">
            <p class="mt-1 text-xs text-slate-500">Será tu identificador de inicio de sesión</p>
          </div>

          <!-- Username (alias público) -->
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Alias público</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">@</span>
              <input v-model="form.username" type="text" required placeholder="gamer-123"
                :class="[
                  'w-full pl-10 pr-4 py-3 bg-slate-900 border rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50',
                  usernameError ? 'border-rose-500/50' : 'border-slate-700'
                ]">
            </div>
            <p class="mt-1 text-xs text-slate-500">Máx. 18 caracteres. Letras, números y guiones.</p>
            <p v-if="usernameError" class="mt-1 text-xs text-rose-400">{{ usernameError }}</p>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Contraseña</label>
            <input v-model="form.password" type="password" required placeholder="Mínimo 8 caracteres"
              class="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50">
          </div>

          <!-- Confirm Password -->
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Confirmar contraseña</label>
            <input v-model="form.confirmPassword" type="password" required placeholder="Repite tu contraseña"
              class="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50">
          </div>

          <!-- Error global -->
          <div v-if="errorMessage" class="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
            {{ errorMessage }}
          </div>

          <button type="submit" :disabled="isSubmitting"
            class="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
            <svg v-if="isSubmitting" class="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isSubmitting ? 'Creando cuenta...' : 'Crear cuenta' }}
          </button>
        </form>

        <div class="mt-6 text-center text-sm text-slate-400">
          ¿Ya tienes cuenta?
          <NuxtLink to="/login" class="text-indigo-400 hover:text-indigo-300 font-medium ml-1">Inicia sesión</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
