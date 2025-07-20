'use client'

import { useEffect, useState, useCallback } from 'react'
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

// Default fallback data to prevent errors
const defaultSalesMetrics: SalesMetrics = {
  daily_sales: [],
  top_products: [],
  period_days: 30
}

const defaultUserMetrics: UserMetrics = {
  new_users_today: 0,
  total_users: 0,
  users_with_orders: 0,
  conversion_rate: 0
}

const defaultProductMetrics: ProductMetrics = {
  most_viewed_products: [],
  low_stock_products: [],
  total_products: 0
}

const defaultDashboardMetrics: DashboardMetrics = {
  total_users: 0,
  total_products: 0,
  total_orders: 0,
  total_revenue: 0,
  avg_order_value: 0,
  conversion_rate: 0,
  top_categories: [],
  recent_orders: []
}

export default function AnalyticsPage() {
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics>(defaultDashboardMetrics)
  const [salesMetrics, setSalesMetrics] = useState<SalesMetrics>(defaultSalesMetrics)
  const [userMetrics, setUserMetrics] = useState<UserMetrics>(defaultUserMetrics)
  const [productMetrics, setProductMetrics] = useState<ProductMetrics>(defaultProductMetrics)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { user, isLoading: authLoading } = useAuth()
  const authenticatedFetch = useAuthenticatedFetch()
  const router = useRouter()

  const fetchAnalytics = useCallback(async () => {
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
          console.warn(`Failed to fetch ${url}:`, e)
          return null
        }
      }

      const [dashboardData, salesData, userData, productData] = await Promise.all([
        fetchWithFallback(`${API_URL}/analytics/dashboard`),
        fetchWithFallback(`${API_URL}/analytics/sales`),
        fetchWithFallback(`${API_URL}/analytics/users`),
        fetchWithFallback(`${API_URL}/analytics/products`)
      ])

      // Set data with safe fallbacks using optional chaining
      setDashboardMetrics(dashboardData || defaultDashboardMetrics)
      setSalesMetrics(salesData || defaultSalesMetrics)
      setUserMetrics(userData || defaultUserMetrics)
      setProductMetrics(productData || defaultProductMetrics)
      
    } catch (err) {
      console.error('Analytics fetch error:', err)
      setError('Failed to load analytics. Using default data.')
      
      // Set fallback data even on error
      setDashboardMetrics(defaultDashboardMetrics)
      setSalesMetrics(defaultSalesMetrics)
      setUserMetrics(defaultUserMetrics)
      setProductMetrics(defaultProductMetrics)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const refreshData = () => {
    fetchAnalytics()
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <button
          onClick={refreshData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Data
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
          <p className="text-2xl font-bold text-gray-900">{dashboardMetrics?.total_users ?? 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
          <p className="text-2xl font-bold text-gray-900">{dashboardMetrics?.total_products ?? 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
          <p className="text-2xl font-bold text-gray-900">{dashboardMetrics?.total_orders ?? 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          <p className="text-2xl font-bold text-gray-900">${dashboardMetrics?.total_revenue?.toFixed(2) ?? '0.00'}</p>
        </div>
      </div>

      {/* Sales Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
          {salesMetrics?.top_products?.length > 0 ? (
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
              <span className="text-sm font-medium">{userMetrics?.new_users_today ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Users with Orders</span>
              <span className="text-sm font-medium">{userMetrics?.users_with_orders ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Conversion Rate</span>
              <span className="text-sm font-medium">{userMetrics?.conversion_rate?.toFixed(2) ?? '0.00'}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Viewed Products</h3>
          {productMetrics?.most_viewed_products?.length > 0 ? (
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
          {productMetrics?.low_stock_products?.length > 0 ? (
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
        {dashboardMetrics?.top_categories?.length > 0 ? (
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
