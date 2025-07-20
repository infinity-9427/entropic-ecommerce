'use client'

import { useState } from 'react'
import { RefreshCw, AlertCircle, Clock, TrendingUp, TrendingDown, Users, Package, ShoppingCart, DollarSign, Eye, Activity, BarChart3, Zap } from 'lucide-react'
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics'

interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

function MetricCard({ title, value, icon, trend, className = '' }: MetricCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className={`w-4 h-4 mr-1 ${trend.isPositive ? '' : 'rotate-180'}`} />
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        <div className="bg-blue-50 rounded-full p-3">
          {icon}
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [autoRefresh, setAutoRefresh] = useState(true)
  const { metrics, loading, error, lastUpdated, refreshMetrics } = useDashboardMetrics(
    autoRefresh ? 30000 : 0
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date)
  }

  if (loading && !metrics) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6 h-32">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Monitor your e-commerce performance in real-time</p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            {/* Auto-refresh toggle */}
            <label className="flex items-center space-x-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Auto-refresh</span>
            </label>
            
            {/* Manual refresh button */}
            <button
              onClick={refreshMetrics}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            
            {/* Last updated indicator */}
            {lastUpdated && (
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Updated {formatTime(lastUpdated)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Connection Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Users"
            value={metrics?.total_users || 0}
            icon={<Users className="w-6 h-6 text-blue-600" />}
            trend={{ value: 12, isPositive: true }}
          />
          
          <MetricCard
            title="Total Products"
            value={metrics?.total_products || 0}
            icon={<Package className="w-6 h-6 text-green-600" />}
            trend={{ value: 8, isPositive: true }}
          />
          
          <MetricCard
            title="Total Orders"
            value={metrics?.total_orders || 0}
            icon={<ShoppingCart className="w-6 h-6 text-purple-600" />}
            trend={{ value: 15, isPositive: true }}
          />
          
          <MetricCard
            title="Total Revenue"
            value={formatCurrency(metrics?.total_revenue || 0)}
            icon={<DollarSign className="w-6 h-6 text-yellow-600" />}
            trend={{ value: 23, isPositive: true }}
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Avg Order Value"
            value={formatCurrency(metrics?.avg_order_value || 0)}
            icon={<BarChart3 className="w-6 h-6 text-orange-600" />}
          />
          
          <MetricCard
            title="Conversion Rate"
            value={`${(metrics?.conversion_rate || 0).toFixed(1)}%`}
            icon={<Zap className="w-6 h-6 text-pink-600" />}
            trend={{ value: 2.4, isPositive: true }}
          />
          
          <MetricCard
            title="Page Views"
            value={metrics?.page_views || 0}
            icon={<Eye className="w-6 h-6 text-indigo-600" />}
          />
          
          <MetricCard
            title="Product Views"
            value={metrics?.product_views || 0}
            icon={<Activity className="w-6 h-6 text-red-600" />}
          />
        </div>

        {/* Categories & Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Categories */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Categories</h3>
            <div className="space-y-3">
              {metrics?.top_categories?.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-900">{category.category}</span>
                  </div>
                  <span className="text-gray-600">{category.count} products</span>
                </div>
              )) || (
                <p className="text-gray-500 italic">No categories data available</p>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
            <div className="space-y-3">
              {metrics?.recent_orders?.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">#{order.order_number || order.id}</p>
                    <p className="text-sm text-gray-600">{order.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(order.total_amount)}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 italic">No recent orders</p>
              )}
            </div>
          </div>
        </div>

        {/* Real-time Status Indicator */}
        <div className="mt-8 flex items-center justify-center space-x-2 text-sm text-gray-500">
          <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-green-500'}`}></div>
          <span>
            {error ? 'Disconnected' : 'Connected'} • 
            {autoRefresh ? ' Auto-refreshing every 30s' : ' Auto-refresh disabled'}
          </span>
        </div>
      </div>
    </div>
  )
}
