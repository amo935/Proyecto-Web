/**
 * Plugin de inicialización: verifica la sesión del usuario
 * al cargar la aplicación (solo en el cliente).
 */
export default defineNuxtPlugin(async () => {
  const { checkSession } = useAuth()
  if (process.client) {
    await checkSession()
  }
})
