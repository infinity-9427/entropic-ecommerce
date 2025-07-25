'use client'

import { useEffect, useState, useCallback, memo } from 'react'
import { useAuth, useAuthenticatedFetch } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

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
    <div className="p-6 relative">
      {/* Loading overlay */}
      {loading && (
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <button
          onClick={refreshData}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh Data'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">{error}</p>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <p className="text-2xl font-bold text-gray-900">{dashboardMetrics?.total_users ?? "No data available"}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
          <p className="text-2xl font-bold text-gray-900">{dashboardMetrics?.total_products ?? "No data available"}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
          <p className="text-2xl font-bold text-gray-900">{dashboardMetrics?.total_orders ?? "No data available"}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          <p className="text-2xl font-bold text-gray-900">{dashboardMetrics?.total_revenue ? `$${dashboardMetrics.total_revenue.toFixed(2)}` : "No data available"}</p>
        </div>
      </div>

      {/* Sales Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
          {salesMetrics?.top_products && salesMetrics.top_products.length > 0 ? (
            <div className="space-y-3">
              {salesMetrics.top_products.map((product, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{product.name}</span>
                  <span className="text-sm font-medium">${product.revenue.toFixed(2)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No sales data available</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">New Users Today</span>
              <span className="text-sm font-medium">{userMetrics?.new_users_today ?? "No data available"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Users with Orders</span>
              <span className="text-sm font-medium">{userMetrics?.users_with_orders ?? "No data available"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Conversion Rate</span>
              <span className="text-sm font-medium">{userMetrics?.conversion_rate ? `${userMetrics.conversion_rate.toFixed(2)}%` : "No data available"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Viewed Products</h3>
          {productMetrics?.most_viewed_products && productMetrics.most_viewed_products.length > 0 ? (
            <div className="space-y-3">
              {productMetrics.most_viewed_products.map((product, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{product.name}</span>
                  <span className="text-sm font-medium">{product.views} views</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No product view data available</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Products</h3>
          {productMetrics?.low_stock_products && productMetrics.low_stock_products.length > 0 ? (
            <div className="space-y-3">
              {productMetrics.low_stock_products.map((product, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{product.name}</span>
                  <span className="text-sm font-medium text-red-600">{product.stock} left</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">All products have adequate stock</p>
          )}
        </div>
      </div>

      {/* Top Categories */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Categories</h3>
        {dashboardMetrics?.top_categories && dashboardMetrics.top_categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dashboardMetrics.top_categories.map((category, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">{category.category}</span>
                <span className="text-sm font-medium">{category.count} products</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No category data available</p>
        )}
      </div>
    </div>
  )
}
