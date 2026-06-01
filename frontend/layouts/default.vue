<script setup>
const { user, isLoggedIn } = useAuth()
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100">
    <!-- Header / Navbar -->
    <header class="sticky top-0 z-50 glass-card bg-slate-900/90 border-b border-slate-700/50 rounded-none backdrop-blur-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <!-- Logo / Brand -->
        <NuxtLink to="/" class="flex items-center gap-3 group">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/25 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span class="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            GameEnder
          </span>
        </NuxtLink>

        <!-- Navigation -->
        <nav class="flex items-center gap-3 sm:gap-4">
          <!-- Usuario logueado -->
          <template v-if="isLoggedIn">
            <NuxtLink
              to="/perfil"
              class="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-800 transition-colors"
              exact-active-class="bg-slate-800"
            >
              <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                {{ user?.username?.charAt(0).toUpperCase() }}
              </div>
              <span class="hidden sm:block text-sm font-medium text-slate-200">{{ user?.username }}</span>
            </NuxtLink>
          </template>

          <!-- Usuario no logueado -->
          <template v-else>
            <NuxtLink
              to="/login"
              class="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Iniciar sesión
            </NuxtLink>
            <NuxtLink
              to="/registro"
              class="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors"
            >
              Registrarse
            </NuxtLink>
          </template>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="border-t border-slate-800 mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-slate-500">
        <p>GameEnder 2024 - Tiempos de videojuegos inspirados en HowLongToBeat</p>
      </div>
    </footer>
  </div>
</template>
