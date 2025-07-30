import { TrendingUp } from 'lucide-react'

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

export function MetricCard({ title, value, icon, iconColor, trend, className = '' }: MetricCardProps) {
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
