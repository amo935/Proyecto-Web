/**
 * Wrapper global para consumir la API externa del backend.
 * Inyecta baseURL desde runtimeConfig y fuerza credentials: 'include'.
 */
export function useApi() {
  const config = useRuntimeConfig()

  const baseURL = config.public.apiBase as string

  async function fetch<T>(
    path: string,
    options: Omit<Parameters<typeof $fetch>[1], 'baseURL'> = {}
  ): Promise<T> {
    return $fetch<T>(path, {
      baseURL,
      credentials: 'include',
      ...options
    })
  }

  return { fetch, baseURL }
}
