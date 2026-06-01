/**
 * Middleware: auth
 *
 * Protege rutas privadas. Si el usuario no está autenticado,
 * redirige a /login.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const { isLoggedIn, isLoading } = useAuth()

  // Esperar a que termine la verificación inicial
  if (isLoading.value) {
    await new Promise(resolve => {
      const unwatch = watch(isLoading, (val) => {
        if (!val) {
          unwatch()
          resolve(true)
        }
      })
    })
  }

  if (!isLoggedIn.value) {
    return navigateTo('/login')
  }
})
