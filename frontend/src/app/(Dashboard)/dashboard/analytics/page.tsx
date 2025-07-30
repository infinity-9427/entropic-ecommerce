'use client'

import { useEffect, useState, useCallback, memo } from 'react'
import { useAuth, useAuthenticatedFetch } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import 'remixicon/fonts/remixicon.css'

interface SalesMetrics {
  daily_sales: Array<{
    date: string
    revenue: number
    orders: number
  }>
  top_products: Array<{
    name: string
    revenue: number
    orders: number
  }>
  period_days: number
}

interface UserMetrics {
  new_users_today: number
  total_users: number
  users_with_orders: number
  conversion_rate: number
}

interface ProductMetrics {
  most_viewed_products: Array<{
    name: string
    views: number
  }>
  low_stock_products: Array<{
    name: string
    stock: number
  }>
  total_products: number
}

interface DashboardMetrics {
  total_users: number
  total_products: number
  total_orders: number
  total_revenue: number
  avg_order_value: number
  conversion_rate: number
  top_categories: Array<{
    category: string
    count: number
  }>
  recent_orders: Array<{
    id: string
    user_id: string
    total_amount: number
    status: string
    created_at: string
  }>
}

export default function AnalyticsPage() {
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null)
  const [salesMetrics, setSalesMetrics] = useState<SalesMetrics | null>(null)
  const [userMetrics, setUserMetrics] = useState<UserMetrics | null>(null)
  const [productMetrics, setProductMetrics] = useState<ProductMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { user, isLoading: authLoading } = useAuth()
  const authenticatedFetch = useAuthenticatedFetch()
  const router = useRouter()

  const fetchAnalytics = useCallback(async () => {
    const startTime = performance.now()
    try {
      setLoading(true)
      setError(null)
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
      
      // Fetch all analytics endpoints with individual error handling
      const fetchWithFallback = async (url: string) => {
        try {
          const response = await fetch(url, {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache',
            }
          })
          if (response.ok) {
            return await response.json()
          }
          return null
        } catch (e) {
          return null
        }
      }

      // Use Promise.all for parallel fetching to reduce total time
      const [dashboardData, salesData, userData, productData] = await Promise.all([
        fetchWithFallback(`${API_URL}/analytics/dashboard`),
        fetchWithFallback(`${API_URL}/analytics/sales`),
        fetchWithFallback(`${API_URL}/analytics/users`),
        fetchWithFallback(`${API_URL}/analytics/products`)
      ])

      // Set data directly without fallbacks
      setDashboardMetrics(dashboardData)
      setSalesMetrics(salesData)
      setUserMetrics(userData)
      setProductMetrics(productData)
      
    } catch (err) {
      console.error('Analytics fetch error:', err)
      setError('Failed to load analytics.')
      
      // Set null data on error
      setDashboardMetrics(null)
      setSalesMetrics(null)
      setUserMetrics(null)
      setProductMetrics(null)
    } finally {
      setLoading(false)
    }
  }, []) // Keep empty dependency array since we don't want this to recreate

  useEffect(() => {
    // Only fetch once on mount, prevent unnecessary re-renders
    fetchAnalytics()
  }, []) // Remove fetchAnalytics dependency to prevent recreation

  const refreshData = () => {
    fetchAnalytics()
  }

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen relative">
      {/* Loading overlay */}
      {loading && (
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600 flex items-center">
            <i className="ri-bar-chart-line mr-2"></i>
            Monitor your e-commerce performance in real-time
          </p>
        </div>
        <button
          onClick={refreshData}
          disabled={loading}
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg shadow-emerald-500/25 flex items-center space-x-2 disabled:opacity-50"
        >
          <i className="ri-refresh-line"></i>
          <span>{loading ? 'Loading...' : 'Refresh Data'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
              <i className="ri-alert-line text-white"></i>
            </div>
            <p className="text-yellow-800 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg shadow-blue-500/25">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold">{dashboardMetrics?.total_users ?? "0"}</p>
              <p className="text-blue-100 text-xs mt-1">Registered users</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <i className="ri-user-line text-2xl"></i>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg shadow-emerald-500/25">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Total Products</p>
              <p className="text-3xl font-bold">{dashboardMetrics?.total_products ?? "0"}</p>
              <p className="text-emerald-100 text-xs mt-1">In catalog</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <i className="ri-package-line text-2xl"></i>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg shadow-purple-500/25">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Orders</p>
              <p className="text-3xl font-bold">{dashboardMetrics?.total_orders ?? "0"}</p>
              <p className="text-purple-100 text-xs mt-1">All time</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <i className="ri-shopping-cart-line text-2xl"></i>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg shadow-amber-500/25">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold">{dashboardMetrics?.total_revenue ? `$${dashboardMetrics.total_revenue.toFixed(2)}` : "$0.00"}</p>
              <p className="text-amber-100 text-xs mt-1">Total earnings</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <i className="ri-money-dollar-circle-line text-2xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
          <div className="p-6 border-b border-gray-200/50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <i className="ri-trophy-line text-white"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Top Products</h3>
            </div>
          </div>
          <div className="p-6">
            {salesMetrics?.top_products && salesMetrics.top_products.length > 0 ? (
              <div className="space-y-4">
                {salesMetrics.top_products.map((product, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200/50">
                    <span className="text-sm font-medium text-gray-900">{product.name}</span>
                    <span className="text-sm font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">${product.revenue.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="ri-bar-chart-line text-xl text-gray-400"></i>
                </div>
                <p className="text-gray-500">No sales data available</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
          <div className="p-6 border-b border-gray-200/50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <i className="ri-user-settings-line text-white"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">User Metrics</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200/50">
                <span className="text-sm font-medium text-gray-700">New Users Today</span>
                <span className="text-sm font-bold text-blue-600 bg-blue-200 px-2 py-1 rounded-full">{userMetrics?.new_users_today ?? "0"}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200/50">
                <span className="text-sm font-medium text-gray-700">Users with Orders</span>
                <span className="text-sm font-bold text-emerald-600 bg-emerald-200 px-2 py-1 rounded-full">{userMetrics?.users_with_orders ?? "0"}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200/50">
                <span className="text-sm font-medium text-gray-700">Conversion Rate</span>
                <span className="text-sm font-bold text-purple-600 bg-purple-200 px-2 py-1 rounded-full">{userMetrics?.conversion_rate ? `${userMetrics.conversion_rate.toFixed(2)}%` : "0%"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
          <div className="p-6 border-b border-gray-200/50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <i className="ri-eye-line text-white"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Most Viewed Products</h3>
            </div>
          </div>
          <div className="p-6">
            {productMetrics?.most_viewed_products && productMetrics.most_viewed_products.length > 0 ? (
              <div className="space-y-4">
                {productMetrics.most_viewed_products.map((product, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200/50">
                    <span className="text-sm font-medium text-gray-900">{product.name}</span>
                    <span className="text-sm font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">{product.views} views</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="ri-eye-off-line text-xl text-gray-400"></i>
                </div>
                <p className="text-gray-500">No product view data available</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
          <div className="p-6 border-b border-gray-200/50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <i className="ri-alert-line text-white"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Low Stock Products</h3>
            </div>
          </div>
          <div className="p-6">
            {productMetrics?.low_stock_products && productMetrics.low_stock_products.length > 0 ? (
              <div className="space-y-4">
                {productMetrics.low_stock_products.map((product, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200/50">
                    <span className="text-sm font-medium text-gray-900">{product.name}</span>
                    <span className="text-sm font-bold text-red-600 bg-red-200 px-2 py-1 rounded-full">{product.stock} left</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="ri-check-line text-xl text-green-500"></i>
                </div>
                <p className="text-green-600 font-medium">All products have adequate stock</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Categories */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
        <div className="p-6 border-b border-gray-200/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <i className="ri-list-check-line text-white"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Top Categories</h3>
          </div>
        </div>
        <div className="p-6">
          {dashboardMetrics?.top_categories && dashboardMetrics.top_categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardMetrics.top_categories.map((category, index) => (
                <div key={index} className="flex justify-between items-center p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200/50 hover:shadow-md transition-all duration-200">
                  <span className="text-sm font-medium text-gray-900">{category.category}</span>
                  <span className="text-sm font-bold text-indigo-600 bg-indigo-200 px-3 py-1 rounded-full">{category.count} products</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-folder-line text-2xl text-gray-400"></i>
              </div>
              <p className="text-gray-500 text-lg">No category data available</p>
              <p className="text-gray-400 text-sm">Categories will appear once products are added</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
