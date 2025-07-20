import { useState, useEffect, useCallback } from 'react'

interface DashboardMetrics {
  total_users: number
  total_products: number
  total_orders: number
  total_revenue: number
  avg_order_value: number
  conversion_rate: number
  page_views: number
  product_views: number
  top_categories: Array<{ category: string; count: number }>
  recent_orders_count: number
  recent_orders: Array<{
    id: number
    order_number: string
    total_amount: number
    status: string
    created_at: string
  }>
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

// Default fallback metrics
const defaultMetrics: DashboardMetrics = {
  total_users: 0,
  total_products: 0,
  total_orders: 0,
  total_revenue: 0,
  avg_order_value: 0,
  conversion_rate: 0,
  page_views: 0,
  product_views: 0,
  top_categories: [],
  recent_orders_count: 0,
  recent_orders: []
}

export function useDashboardMetrics(refreshInterval: number = 0) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchMetrics = useCallback(async () => {
    try {
      setError(null)
      
      const response = await fetch(`${API_URL}/analytics/dashboard`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      // Use optional chaining and fallbacks for all properties
      setMetrics({
        total_users: data?.total_users ?? 0,
        total_products: data?.total_products ?? 0,
        total_orders: data?.total_orders ?? 0,
        total_revenue: data?.total_revenue ?? 0,
        avg_order_value: data?.avg_order_value ?? 0,
        conversion_rate: data?.conversion_rate ?? 0,
        page_views: data?.page_views ?? 0,
        product_views: data?.product_views ?? 0,
        top_categories: data?.top_categories ?? [],
        recent_orders_count: data?.recent_orders_count ?? 0,
        recent_orders: data?.recent_orders ?? []
      })
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Dashboard metrics fetch error:', err)
      setError('Failed to load dashboard data. Using fallback values.')
      // Set fallback data instead of null
      setMetrics(defaultMetrics)
      setMetrics(defaultMetrics)
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard metrics')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Initial fetch
    fetchMetrics()

    // Set up polling for real-time updates
    const interval = setInterval(fetchMetrics, refreshInterval)

    return () => clearInterval(interval)
  }, [fetchMetrics, refreshInterval])

  const refreshMetrics = useCallback(() => {
    setLoading(true)
    fetchMetrics()
  }, [fetchMetrics])

  return {
    metrics,
    loading,
    error,
    lastUpdated,
    refreshMetrics
  }
}
