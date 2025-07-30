'use client'

import { useState } from 'react'
import { RefreshCw, AlertCircle, Clock, TrendingUp } from 'lucide-react'
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics'
import 'remixicon/fonts/remixicon.css'

interface MetricCardProps {
  title: string
  value: string | number
  icon: string
  iconColor: string
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

function MetricCard({ title, value, icon, iconColor, trend, className = '' }: MetricCardProps) {
  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-200 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 ${iconColor} rounded-xl flex items-center justify-center shadow-lg`}>
              <i className={`${icon} text-xl text-white`}></i>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
          {trend && (
            <div className={`flex items-center mt-4 text-sm font-medium ${trend.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
              <TrendingUp className={`w-4 h-4 mr-1 ${trend.isPositive ? '' : 'rotate-180'}`} />
              {Math.abs(trend.value)}% from last month
            </div>
          )}
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <div className="h-10 bg-gray-300 rounded-lg w-48 mb-3"></div>
                <div className="h-6 bg-gray-300 rounded-lg w-96"></div>
              </div>
              <div className="flex space-x-4">
                <div className="h-12 bg-gray-300 rounded-lg w-32"></div>
                <div className="h-12 bg-gray-300 rounded-lg w-24"></div>
              </div>
            </div>
            
            {/* Metrics skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                      <div className="h-8 bg-gray-300 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Bottom cards skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="h-6 bg-gray-300 rounded w-32 mb-4"></div>
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="h-4 bg-gray-300 rounded w-32"></div>
                      <div className="h-4 bg-gray-300 rounded w-20"></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="h-6 bg-gray-300 rounded w-32 mb-4"></div>
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-16"></div>
                      </div>
                      <div>
                        <div className="h-4 bg-gray-300 rounded w-16 mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-12"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600 flex items-center">
            <i className="ri-dashboard-line mr-2"></i>
            Monitor your e-commerce performance in real-time
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Manual refresh button */}
          <button
            onClick={refreshMetrics}
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-blue-500/25 flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          
          {/* Last updated indicator */}
          {lastUpdated && (
            <div className="flex items-center space-x-2 text-sm text-gray-500 bg-white/80 rounded-xl px-4 py-2 shadow-sm border border-white/20 backdrop-blur-sm">
              <Clock className="w-4 h-4" />
              <span>Updated {formatTime(lastUpdated)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800 mb-1">Connection Error</h3>
              <p className="text-red-700">{error}</p>
              <p className="text-sm text-red-600 mt-2">Please check your internet connection and try refreshing the page.</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Users"
            value={metrics?.total_users ?? "No data available"}
            icon="ri-group-line"
            iconColor="bg-gradient-to-r from-blue-500 to-blue-600"
            trend={metrics?.total_users ? { value: 12, isPositive: true } : undefined}
          />
          
          <MetricCard
            title="Total Products"
            value={metrics?.total_products ?? "No data available"}
            icon="ri-store-line"
            iconColor="bg-gradient-to-r from-emerald-500 to-emerald-600"
            trend={metrics?.total_products ? { value: 8, isPositive: true } : undefined}
          />
          
          <MetricCard
            title="Total Orders"
            value={metrics?.total_orders ?? "No data available"}
            icon="ri-shopping-cart-line"
            iconColor="bg-gradient-to-r from-purple-500 to-purple-600"
            trend={metrics?.total_orders ? { value: 15, isPositive: true } : undefined}
          />
          
          <MetricCard
            title="Total Revenue"
            value={metrics?.total_revenue ? formatCurrency(metrics.total_revenue) : "No data available"}
            icon="ri-money-dollar-circle-line"
            iconColor="bg-gradient-to-r from-amber-500 to-amber-600"
            trend={metrics?.total_revenue ? { value: 23, isPositive: true } : undefined}
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Avg Order Value"
            value={metrics?.avg_order_value ? formatCurrency(metrics.avg_order_value) : "No data available"}
            icon="ri-bar-chart-line"
            iconColor="bg-gradient-to-r from-orange-500 to-orange-600"
          />
          
          <MetricCard
            title="Conversion Rate"
            value={metrics?.conversion_rate ? `${metrics.conversion_rate.toFixed(1)}%` : "No data available"}
            icon="ri-flashlight-line"
            iconColor="bg-gradient-to-r from-pink-500 to-pink-600"
            trend={metrics?.conversion_rate ? { value: 2.4, isPositive: true } : undefined}
          />
          
          <MetricCard
            title="Page Views"
            value={metrics?.page_views ?? "No data available"}
            icon="ri-eye-line"
            iconColor="bg-gradient-to-r from-indigo-500 to-indigo-600"
          />
          
          <MetricCard
            title="Product Views"
            value={metrics?.product_views ?? "No data available"}
            icon="ri-line-chart-line"
            iconColor="bg-gradient-to-r from-red-500 to-red-600"
          />
        </div>

        {/* Categories & Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Categories */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <i className="ri-list-check text-white"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Top Categories</h3>
            </div>
            <div className="space-y-4">
              {metrics?.top_categories?.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-blue-50 hover:to-blue-100 transition-all duration-200 group">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      {index + 1}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{category.category}</span>
                      <p className="text-sm text-gray-500">{category.count} products available</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">{category.count}</span>
                    <i className="ri-arrow-right-line text-gray-400 group-hover:text-blue-500 transition-colors"></i>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8">
                  <i className="ri-folder-open-line text-4xl text-gray-300 mb-3"></i>
                  <p className="text-gray-500 italic">No categories data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <i className="ri-shopping-bag-line text-white"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Recent Orders</h3>
            </div>
            <div className="space-y-4">
              {metrics?.recent_orders?.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-emerald-50 hover:to-emerald-100 transition-all duration-200 group">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                      <i className="ri-receipt-line text-white"></i>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">#{order.order_number || order.id}</p>
                      <p className="text-sm flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-lg">{formatCurrency(order.total_amount)}</p>
                    <p className="text-xs text-gray-500 flex items-center">
                      <i className="ri-calendar-line mr-1"></i>
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8">
                  <i className="ri-shopping-cart-line text-4xl text-gray-300 mb-3"></i>
                  <p className="text-gray-500 italic">No recent orders</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Real-time Status Indicator */}
        <div className="flex items-center justify-center">
          <div className="bg-white rounded-full px-6 py-3 shadow-sm border border-gray-200 flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${error ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'} shadow-lg`}></div>
            <span className="text-sm font-medium text-gray-700">
              {error ? 'Disconnected' : 'Connected'} • 
              {autoRefresh ? ' Auto-refreshing every 30s' : ' Auto-refresh disabled'}
            </span>
            {!error && (
              <i className="ri-wifi-line text-emerald-600"></i>
            )}
            {error && (
              <i className="ri-wifi-off-line text-red-600"></i>
            )}
          </div>
        </div>
      </div>
    )
  }
