'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import 'remixicon/fonts/remixicon.css'
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-72 bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <i className="ri-dashboard-line text-xl text-white"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Entropic
                </h1>
                <p className="text-xs text-slate-400">Dashboard</p>
              </div>
            </div>
            
            {/* User Info */}
            <div className="bg-slate-800/50 rounded-xl p-4 backdrop-blur-sm border border-slate-700/30">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                  <i className="ri-user-line text-white"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300">Welcome back,</p>
                  <p className="font-semibold text-white truncate">
                    {user?.first_name || 'Guest'} {user?.last_name || 'User'}
                  </p>
                  {user?.is_admin && (
                    <span className="inline-flex items-center px-2 py-1 text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full mt-1 shadow-sm">
                      <i className="ri-vip-crown-line mr-1"></i>
                      Admin
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="px-4 py-6 space-y-2 flex-1">
            <Link
              href="/dashboard"
              className={`group flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                isActiveRoute('/dashboard') 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-all duration-200 ${
                isActiveRoute('/dashboard') 
                  ? 'bg-white/20' 
                  : 'bg-slate-700/50 group-hover:bg-slate-600/50'
              }`}>
                <i className="ri-dashboard-3-line text-lg"></i>
              </div>
              <span className="font-medium">Overview</span>
              {isActiveRoute('/dashboard') && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
              )}
            </Link>

            <Link
              href="/dashboard/analytics"
              className={`group flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                isActiveRoute('/dashboard/analytics') 
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-all duration-200 ${
                isActiveRoute('/dashboard/analytics') 
                  ? 'bg-white/20' 
                  : 'bg-slate-700/50 group-hover:bg-slate-600/50'
              }`}>
                <i className="ri-bar-chart-line text-lg"></i>
              </div>
              <span className="font-medium">Analytics</span>
              {isActiveRoute('/dashboard/analytics') && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
              )}
            </Link>

            <Link
              href="/dashboard/products"
              className={`group flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                isActiveRoute('/dashboard/products') 
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-all duration-200 ${
                isActiveRoute('/dashboard/products') 
                  ? 'bg-white/20' 
                  : 'bg-slate-700/50 group-hover:bg-slate-600/50'
              }`}>
                <i className="ri-package-line text-lg"></i>
              </div>
              <span className="font-medium">Products</span>
              {isActiveRoute('/dashboard/products') && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
              )}
            </Link>

            <Link
              href="/dashboard/orders"
              className={`group flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                isActiveRoute('/dashboard/orders') 
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-all duration-200 ${
                isActiveRoute('/dashboard/orders') 
                  ? 'bg-white/20' 
                  : 'bg-slate-700/50 group-hover:bg-slate-600/50'
              }`}>
                <i className="ri-shopping-cart-line text-lg"></i>
              </div>
              <span className="font-medium">Orders</span>
              {isActiveRoute('/dashboard/orders') && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
              )}
            </Link>

            <Link
              href="/dashboard/users"
              className={`group flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                isActiveRoute('/dashboard/users') 
                  ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg shadow-pink-500/25' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-all duration-200 ${
                isActiveRoute('/dashboard/users') 
                  ? 'bg-white/20' 
                  : 'bg-slate-700/50 group-hover:bg-slate-600/50'
              }`}>
                <i className="ri-group-line text-lg"></i>
              </div>
              <span className="font-medium">Users</span>
              {isActiveRoute('/dashboard/users') && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
              )}
            </Link>
          </nav>

          {/* Bottom Section */}
          <div className="p-4 border-t border-slate-700/30">
            <div className="bg-slate-800/50 rounded-xl p-4 backdrop-blur-sm border border-slate-700/30">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-300">System Status</span>
              </div>
              <p className="text-xs text-slate-400">All services operational</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="h-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
