import type { PublicUser, UserLoginInput, UserRegisterInput } from '~/types/user'

/**
 * Composable global para gestión de autenticación.
 * El estado del usuario se comparte entre todos los componentes.
 */
export function useAuth() {
  const user = useState<PublicUser | null>('auth-user', () => null)
  const isLoading = useState<boolean>('auth-loading', () => true)
  const api = useApi()

  async function checkSession() {
    try {
      const me = await api.fetch<PublicUser | null>('/auth/me', {
        server: false
      })
      user.value = me
    } catch {
      user.value = null
    } finally {
      isLoading.value = false
    }
  }

  async function login(input: UserLoginInput): Promise<void> {
    const loggedUser = await api.fetch<PublicUser>('/auth/login', {
      method: 'POST',
      body: input
    })
    user.value = loggedUser
  }

  async function register(input: UserRegisterInput): Promise<void> {
    const newUser = await api.fetch<PublicUser>('/auth/register', {
      method: 'POST',
      body: input
    })
    user.value = newUser
  }

  async function logout(): Promise<void> {
    await api.fetch('/auth/logout', {
      method: 'POST'
    })
    user.value = null
    await navigateTo('/')
  }

  const isLoggedIn = computed(() => !!user.value)

  return {
    user,
    isLoading,
    isLoggedIn,
    checkSession,
    login,
    register,
    logout
  }
}
