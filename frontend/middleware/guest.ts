/**
 * Middleware: guest
 *
 * Evita que usuarios autenticados accedan a /login o /registro.
 * Redirige a /perfil si ya tienen sesión.
 */
export default defineNuxtRouteMiddleware(async () => {
  const { isLoggedIn, isLoading } = useAuth()

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

  if (isLoggedIn.value) {
    return navigateTo('/perfil')
  }
})
