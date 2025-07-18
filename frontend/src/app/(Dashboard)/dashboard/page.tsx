'use client'

import { useEffect, useState } from 'react'

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

const StatCard = ({ title, value, icon, change }: { title: string; value: string | number; icon: string; change?: string }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change && (
          <p className="text-sm text-green-600 mt-1">{change}</p>
        )}
      </div>
      <div className="text-3xl">{icon}</div>
    </div>
  </div>
)

const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
    {children}
  </div>
)

export default function DashboardPage() {
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null)
  const [salesMetrics, setSalesMetrics] = useState<SalesMetrics | null>(null)
  const [userMetrics, setUserMetrics] = useState<UserMetrics | null>(null)
  const [productMetrics, setProductMetrics] = useState<ProductMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [dashboardRes, salesRes, userRes, productRes] = await Promise.all([
          fetch('http://localhost:8000/analytics/dashboard'),
          fetch('http://localhost:8000/analytics/sales'),
          fetch('http://localhost:8000/analytics/users'),
          fetch('http://localhost:8000/analytics/products')
        ])

        // Handle each response individually - don't fail if one fails
        const dashboardData = dashboardRes.ok ? await dashboardRes.json() : null
        const salesData = salesRes.ok ? await salesRes.json() : null
        const userData = userRes.ok ? await userRes.json() : null
        const productData = productRes.ok ? await productRes.json() : null

        setDashboardMetrics(dashboardData || {
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
        })

        setSalesMetrics(salesData || {
          daily_sales: [],
          top_products: [],
          period_days: 30
        })

        setUserMetrics(userData || {
          new_users_today: 0,
          total_users: 0,
          users_with_orders: 0,
          conversion_rate: 0
        })

        setProductMetrics(productData || {
          most_viewed_products: [],
          low_stock_products: [],
          total_products: 0
        })

      } catch (err) {
        console.error('Analytics fetch error:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics data')
        
        // Set fallback data even on error
        setDashboardMetrics({
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
        })

        setSalesMetrics({
          daily_sales: [],
          top_products: [],
          period_days: 30
        })

        setUserMetrics({
          new_users_today: 0,
          total_users: 0,
          users_with_orders: 0,
          conversion_rate: 0
        })

        setProductMetrics({
          most_viewed_products: [],
          low_stock_products: [],
          total_products: 0
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
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
            <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${dashboardMetrics?.total_revenue?.toFixed(2) || 0}`}
          icon="💰"
          change="+12.3%"
        />
        <StatCard
          title="Total Orders"
          value={dashboardMetrics?.total_orders || 0}
          icon="📦"
          change="+5.2%"
        />
        <StatCard
          title="Total Products"
          value={dashboardMetrics?.total_products || 0}
          icon="🛍️"
        />
        <StatCard
          title="Total Users"
          value={dashboardMetrics?.total_users || 0}
          icon="👥"
          change="+8.1%"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Avg Order Value"
          value={`$${dashboardMetrics?.avg_order_value?.toFixed(2) || 0}`}
          icon="💳"
        />
        <StatCard
          title="Conversion Rate"
          value={`${dashboardMetrics?.conversion_rate?.toFixed(1) || 0}%`}
          icon="📈"
        />
        <StatCard
          title="Page Views"
          value={dashboardMetrics?.page_views || 0}
          icon="👁️"
        />
        <StatCard
          title="Product Views"
          value={dashboardMetrics?.product_views || 0}
          icon="🔍"
        />
      </div>

      {/* Charts and Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <ChartCard title="Daily Sales (Last 30 Days)">
          <div className="space-y-3">
            {(salesMetrics?.daily_sales || []).slice(-7).map((sale) => (
              <div key={sale.date} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{sale.date}</p>
                  <p className="text-sm text-gray-600">{sale.orders} orders</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">${sale.revenue?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            ))}
            {(!salesMetrics?.daily_sales || salesMetrics.daily_sales.length === 0) && (
              <p className="text-gray-500">No sales data available</p>
            )}
          </div>
        </ChartCard>

        {/* Top Categories */}
        <ChartCard title="Top Categories">
          <div className="space-y-3">
            {(dashboardMetrics?.top_categories || []).map((category) => (
              <div key={category.category} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{category.category}</p>
                  <p className="text-sm text-gray-600">Products</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">{category.count}</p>
                </div>
              </div>
            ))}
            {(!dashboardMetrics?.top_categories || dashboardMetrics.top_categories.length === 0) && (
              <p className="text-gray-500">No category data available</p>
            )}
          </div>
        </ChartCard>

        {/* Top Products */}
        <ChartCard title="Top Products by Revenue">
          <div className="space-y-3">
            {(salesMetrics?.top_products || []).slice(0, 5).map((product) => (
              <div key={product.name} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-gray-600">{product.orders} orders</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">${product.revenue?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            ))}
            {(!salesMetrics?.top_products || salesMetrics.top_products.length === 0) && (
              <p className="text-gray-500">No product data available</p>
            )}
          </div>
        </ChartCard>

        {/* Most Viewed Products */}
        <ChartCard title="Most Viewed Products">
          <div className="space-y-3">
            {(productMetrics?.most_viewed_products || []).slice(0, 5).map((product) => (
              <div key={product.name} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-gray-600">Product</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">{product.views} views</p>
                </div>
              </div>
            ))}
            {(!productMetrics?.most_viewed_products || productMetrics.most_viewed_products.length === 0) && (
              <p className="text-gray-500">No view data available</p>
            )}
          </div>
        </ChartCard>
      </div>

      {/* User Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="User Analytics">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">New Users Today</span>
              <span className="font-bold text-blue-600">{userMetrics?.new_users_today || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Users</span>
              <span className="font-bold text-gray-900">{userMetrics?.total_users || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Users with Orders</span>
              <span className="font-bold text-green-600">{userMetrics?.users_with_orders || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">User Conversion Rate</span>
              <span className="font-bold text-purple-600">{userMetrics?.conversion_rate?.toFixed(1) || 0}%</span>
            </div>
          </div>
        </ChartCard>

        {/* Low Stock Alert */}
        <ChartCard title="Low Stock Alert">
          <div className="space-y-3">
            {(productMetrics?.low_stock_products || []).map((product) => (
              <div key={product.name} className="flex items-center justify-between p-3 bg-red-50 rounded border border-red-200">
                <div>
                  <p className="font-medium text-red-800">{product.name}</p>
                  <p className="text-sm text-red-600">Low stock warning</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">{product.stock} left</p>
                </div>
              </div>
            ))}
            {(!productMetrics?.low_stock_products || productMetrics.low_stock_products.length === 0) && (
              <p className="text-gray-500">All products have sufficient stock</p>
            )}
          </div>
        </ChartCard>
      </div>

      {/* Recent Orders */}
      {dashboardMetrics?.recent_orders && dashboardMetrics.recent_orders.length > 0 && (
        <ChartCard title="Recent Orders">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(dashboardMetrics.recent_orders || []).map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${order.total_amount?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'shipped' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      )}
    </div>
  )
}
