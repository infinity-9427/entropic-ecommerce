import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Eye,
  Activity,
  Clock,
  BarChart3,
  Zap
} from 'lucide-react'

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

export function MetricCard({ title, value, icon, trend, className = '' }: MetricCardProps) {
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

export const dashboardIcons = {
  users: <Users className="w-6 h-6 text-blue-600" />,
  products: <Package className="w-6 h-6 text-green-600" />,
  orders: <ShoppingCart className="w-6 h-6 text-purple-600" />,
  revenue: <DollarSign className="w-6 h-6 text-yellow-600" />,
  views: <Eye className="w-6 h-6 text-indigo-600" />,
  activity: <Activity className="w-6 h-6 text-red-600" />,
  clock: <Clock className="w-6 h-6 text-gray-600" />,
  chart: <BarChart3 className="w-6 h-6 text-orange-600" />,
  zap: <Zap className="w-6 h-6 text-pink-600" />
}
