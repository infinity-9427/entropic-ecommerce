'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
// Temporarily commented out for development
// import { useRouter } from 'next/navigation'
// import { useEffect } from 'react'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth()
  const pathname = usePathname()
  // const router = useRouter()

  // Helper function to check if route is active
  const isActiveRoute = (route: string) => {
    if (route === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(route)
  }

  // Temporarily disable authentication for dashboard during development
  // TODO: Re-enable authentication for production
  /*
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }
  */

  // Temporarily disabled for development
  // const handleLogout = () => {
  //   logout()
  //   router.push('/login')
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Entropic Dashboard
            </h1>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Welcome,</p>
              <p className="font-medium text-gray-800">
                {user?.first_name || 'Guest'} {user?.last_name || 'User'}
              </p>
              {user?.is_admin && (
                <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                  Admin
                </span>
              )}
            </div>
          </div>
          <nav className="mt-6">
            <div className="px-6 py-3">
              <Link
                href="/dashboard"
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  isActiveRoute('/dashboard') 
                    ? 'text-white bg-blue-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
                Overview
              </Link>
            </div>
            <div className="px-6 py-3">
              <Link
                href="/dashboard/analytics"
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  isActiveRoute('/dashboard/analytics') 
                    ? 'text-white bg-blue-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Analytics
              </Link>
            </div>
            <div className="px-6 py-3">
              <Link
                href="/dashboard/products"
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  isActiveRoute('/dashboard/products') 
                    ? 'text-white bg-blue-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Products
              </Link>
            </div>
            <div className="px-6 py-3">
              <Link
                href="/dashboard/orders"
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  isActiveRoute('/dashboard/orders') 
                    ? 'text-white bg-blue-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Orders
              </Link>
            </div>
            <div className="px-6 py-3">
              <Link
                href="/dashboard/users"
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  isActiveRoute('/dashboard/users') 
                    ? 'text-white bg-blue-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                Users
              </Link>
            </div>
            
            {/* Logout Button - Temporarily disabled for development */}
            <div className="px-6 py-3 mt-auto">
              <button
                onClick={() => {
                  // Temporarily disabled for development
                  // handleLogout()
                  console.log('Logout temporarily disabled for development')
                }}
                className="w-full flex items-center px-4 py-2 text-gray-400 hover:bg-gray-50 rounded-lg cursor-not-allowed"
                disabled
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout (Disabled)
              </button>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
