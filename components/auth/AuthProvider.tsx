'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export interface User {
  id: string
  Username: string
  firstName: string
  lastName: string
  role: string
  isActive: boolean
  email?: string
  createdAt: Date
  lastLoginAt?: Date
}

export interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (token: string, user: User) => void
  logout: () => void
  checkAuth: () => Promise<boolean>
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Initialize auth from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')
        
        if (storedToken && storedUser) {
          setToken(storedToken)
          setUser(JSON.parse(storedUser))
          
          // Verify token with backend on page load
          verifyToken(storedToken).catch(() => {
            logout()
          })
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        logout()
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const verifyToken = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/project_pulse/Auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          setUser(data.user)
          localStorage.setItem('user', JSON.stringify(data.user))
          return true
        }
      }
      return false
    } catch (error) {
      console.error('Token verification error:', error)
      return false
    }
  }

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  const checkAuth = async (): Promise<boolean> => {
    const storedToken = localStorage.getItem('token')
    
    if (!storedToken) {
      logout()
      return false
    }

    const isValid = await verifyToken(storedToken)
    if (!isValid) {
      logout()
      return false
    }

    return true
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  // Check authentication status on route change
  useEffect(() => {
    if (!isLoading && token && user) {
      // Skip auth check for public routes
      const isPublicRoute = [
        '/',
        '/login',
        '/register',
        '/forgot-password',
        '/reset-password',
      ].some(route => pathname.startsWith(route))

      if (!isPublicRoute) {
        checkAuth()
      }
    }
  }, [pathname, isLoading])

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      login,
      logout,
      checkAuth,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}