/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'

interface UseAuthFetchOptions extends RequestInit {
  requireAuth?: boolean
}

export function useAuthFetch() {
  const { token, logout } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const authFetch = useCallback(async <T = any>(
    url: string,
    options: UseAuthFetchOptions = {}
  ): Promise<{ data: T | null; error: string | null }> => {
    setIsLoading(true)
    setError(null)

    try {
      const headers = new Headers({ 'Content-Type': 'application/json' })

      // merge options.headers into Headers instance (handles Headers, array, or plain object)
      if (options.headers) {
        if (options.headers instanceof Headers) {
          options.headers.forEach((value, key) => headers.set(key, value))
        } else if (Array.isArray(options.headers)) {
          options.headers.forEach(([key, value]) => headers.set(key, String(value)))
        } else {
          Object.entries(options.headers).forEach(([key, value]) => headers.set(key, String(value)))
        }
      }

      // Add Authorization header if token exists
      if (token && options.requireAuth !== false) {
        headers.set('Authorization', `Bearer ${token}`)
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${url}`, {
        ...options,
        headers,
      })

      // Handle 401 Unauthorized
      if (response.status === 401) {
        logout()
        throw new Error('Session expired. Please login again.')
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Request failed')
      }

      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [token, logout])

  return { authFetch, isLoading, error }
}