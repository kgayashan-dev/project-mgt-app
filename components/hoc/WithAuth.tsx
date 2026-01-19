'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: {
    roles?: string[]
    redirectTo?: string
  }
) {
  return function WithAuthComponent(props: P) {
    const { user, token, isLoading, checkAuth } = useAuth()
    const router = useRouter()
    const [isAuthorized, setIsAuthorized] = useState(false)

    useEffect(() => {
      const verifyAuth = async () => {
        const isAuthenticated = await checkAuth()
        
        if (!isAuthenticated) {
          router.push(options?.redirectTo || '/login')
          return
        }

        // Check role-based access if roles are specified
        if (options?.roles && user) {
          const hasRequiredRole = options.roles.includes(user.role)
          if (!hasRequiredRole) {
            router.push('/unauthorized')
            return
          }
        }

        setIsAuthorized(true)
      }

      if (!isLoading) {
        verifyAuth()
      }
    }, [user, token, isLoading, checkAuth, router])

    if (isLoading || !isAuthorized) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      )
    }

    return <WrappedComponent {...props} />
  }
}