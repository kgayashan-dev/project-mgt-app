'use client'

import { ReactNode, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'

interface RouteGuardProps {
  children: ReactNode
  requireAuth?: boolean
  allowedRoles?: string[]
  redirectTo?: string
}

export default function RouteGuard({ 
  children, 
  requireAuth = true,
  allowedRoles = [],
  redirectTo = '/login'
}: RouteGuardProps) {
  const { user, token, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password']
  const isPublicRoute = publicRoutes.some(route => pathname === route)

  useEffect(() => {
    if (isLoading) return

    // If route doesn't require auth, skip validation
    if (!requireAuth || isPublicRoute) return

    // Check if user is authenticated
    if (!token || !user) {
      router.push(`${redirectTo}?from=${encodeURIComponent(pathname)}`)
      return
    }

    // Check role-based access
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      router.push('/unauthorized')
    }
  }, [user, token, isLoading, pathname, router, requireAuth, allowedRoles, redirectTo, isPublicRoute])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If route requires auth but user is not authenticated, don't render children
  if (requireAuth && !token && !isPublicRoute) {
    return null
  }

  return <>{children}</>
}