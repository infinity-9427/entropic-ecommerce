'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth, useAuthenticatedFetch } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { MetricCard } from '@/components/metric-card'
import 'remixicon/fonts/remixicon.css'

interface OrderItem {
  id: number
  product_id: number
  quantity: number
  price: number
  product: {
    name: string
    image_url: string
  }
}

interface Order {
  id: number
  user_id: number
  status: string
  total_amount: number
  created_at: string
  items: OrderItem[]
  user: {
    first_name: string
    last_name: string
    email: string
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { user, isLoading: authLoading } = useAuth()
  const authenticatedFetch = useAuthenticatedFetch()
  const router = useRouter()

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
      
      // Try multiple endpoints for orders
      const endpoints = [
        `${API_URL}/admin/orders`,
        `${API_URL}/orders`
      ]
      
      let success = false
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache',
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            setOrders(Array.isArray(data) ? data : [])
            success = true
            break
          }
        } catch (e) {
          console.warn(`Failed to fetch from ${endpoint}:`, e)
        }
      }
      
      if (!success) {
        console.warn('Orders API not available.')
        setOrders([])
        setError('Orders API not available.')
      }
      
    } catch (err) {
      console.error('Orders fetch error:', err)
      setError('Failed to load orders. Check if the backend is running.')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Temporarily disable authentication guards for development
    // TODO: Re-enable for production
    /*
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
    
    if (user) {
      fetchOrders()
    }
    */
    
    // Allow access without authentication for development
    fetchOrders()
  }, []) // Empty dependency array to prevent infinite loops

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading orders</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0)
  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Orders</h1>
          <p className="text-gray-600 flex items-center">
            <i className="ri-shopping-cart-line mr-2"></i>
            Manage and track all customer orders
          </p>
        </div>
        <button className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-200 shadow-lg shadow-amber-500/25 flex items-center space-x-2">
          <i className="ri-download-line"></i>
          <span>Export Orders</span>
        </button>
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Orders"
          value={orders.length}
          icon="ri-shopping-cart-line"
          iconColor="bg-gradient-to-r from-blue-500 to-blue-600"
        />
        
        <MetricCard
          title="Total Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
          icon="ri-money-dollar-circle-line"
          iconColor="bg-gradient-to-r from-emerald-500 to-emerald-600"
        />
        
        <MetricCard
          title="Average Order"
          value={`$${averageOrderValue.toFixed(2)}`}
          icon="ri-bar-chart-line"
          iconColor="bg-gradient-to-r from-purple-500 to-purple-600"
        />
        
        <MetricCard
          title="Pending Orders"
          value={(orders || []).filter(o => o?.status?.toLowerCase() === 'pending').length}
          icon="ri-time-line"
          iconColor="bg-gradient-to-r from-amber-500 to-amber-600"
        />
      </div>

      {/* Orders by Status */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
        <div className="p-6 border-b border-gray-200/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <i className="ri-pie-chart-line text-white"></i>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Order Status Distribution</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from(new Set((orders || []).map(o => o?.status).filter(Boolean))).map((status) => {
              const statusOrders = (orders || []).filter(o => o?.status === status)
              const statusRevenue = statusOrders.reduce((sum, o) => sum + (o?.total_amount || 0), 0)
              
              return (
                <div key={status} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200/50 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900 capitalize">{status}</h3>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(status)}`}>
                      {statusOrders.length}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Revenue:</span>
                      <span className="font-medium text-gray-900">${statusRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Average:</span>
                      <span className="font-medium text-gray-900">${statusOrders.length > 0 ? (statusRevenue / statusOrders.length).toFixed(2) : '0.00'}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
        <div className="p-6 border-b border-gray-200/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <i className="ri-table-line text-white"></i>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(orders || []).map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.user?.first_name} {order.user?.last_name}
                    </div>
                    <div className="text-sm text-gray-500">{order.user?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {order.items?.slice(0, 3).map((item, index) => (
                        <div key={index} className="relative h-8 w-8 rounded overflow-hidden">
                          <Image
                            fill
                            className="object-cover"
                            src={item.product?.image_url || '/placeholder-brand.svg'}
                            alt={item.product?.name || 'Product'}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-brand.svg'
                            }}
                          />
                        </div>
                      ))}
                      {order.items && order.items.length > 3 && (
                        <span className="text-sm text-gray-500">+{order.items.length - 3} more</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0} items
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${order.total_amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="inline-flex items-center text-blue-600 hover:text-blue-900">
                        <i className="ri-eye-line mr-1"></i>
                        View
                      </button>
                      <button className="inline-flex items-center text-green-600 hover:text-green-900">
                        <i className="ri-edit-line mr-1"></i>
                        Edit
                      </button>
                      <button className="inline-flex items-center text-purple-600 hover:text-purple-900">
                        <i className="ri-truck-line mr-1"></i>
                        Ship
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Order Activity */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
        <div className="p-6 border-b border-gray-200/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <i className="ri-pulse-line text-white"></i>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {(orders || []).slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200/50 hover:shadow-md transition-all duration-200">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                      <span className="text-white font-semibold text-sm">
                        {order.user?.first_name?.charAt(0)}{order.user?.last_name?.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {order.user?.first_name} {order.user?.last_name} placed order #{order.id}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center space-x-2">
                      <span>{order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0} items</span>
                      <span>•</span>
                      <span className="font-medium">${order.total_amount.toFixed(2)}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <span className="text-sm text-gray-500 font-medium">
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
