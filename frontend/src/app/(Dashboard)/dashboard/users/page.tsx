'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth, useAuthenticatedFetch } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import 'remixicon/fonts/remixicon.css'

interface User {
  id: number
  email: string
  username: string
  first_name: string
  last_name: string
  is_active: boolean
  is_admin: boolean
  created_at: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { user, isLoading: authLoading } = useAuth()
  const authenticatedFetch = useAuthenticatedFetch()
  const router = useRouter()

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
      
      const response = await fetch(`${API_URL}/admin/users`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
      
      if (!response.ok) {
        console.warn(`Users API not available (${response.status}).`)
        setUsers([])
        setError('Users API not available.')
        return
      }
      
      const data = await response.json()
      setUsers(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Users fetch error:', err)
      setError('Failed to load users. Check if the backend is running.')
      setUsers([])
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
    
    if (!authLoading && user && !user.is_admin) {
      router.push('/dashboard')
      return
    }
    
    if (user && user.is_admin) {
      fetchUsers()
    }
    */
    
    // Allow access without authentication for development
    fetchUsers()
  }, []) // Empty dependency array to prevent infinite loops // Removed user, authLoading, router dependencies

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
            <h3 className="text-sm font-medium text-red-800">Error loading users</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Users</h1>
          <p className="text-gray-600 flex items-center">
            <i className="ri-group-line mr-2"></i>
            Manage user accounts and permissions
          </p>
        </div>
        <button className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-pink-600 hover:to-pink-700 transition-all duration-200 shadow-lg shadow-pink-500/25 flex items-center space-x-2">
          <i className="ri-user-add-line"></i>
          <span>Add New User</span>
        </button>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg shadow-blue-500/25">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold">{(users || []).length}</p>
              <p className="text-blue-100 text-xs mt-1">Registered members</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <i className="ri-group-line text-2xl"></i>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg shadow-emerald-500/25">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Active Users</p>
              <p className="text-3xl font-bold">{(users || []).filter(u => u?.is_active).length}</p>
              <p className="text-emerald-100 text-xs mt-1">Currently active</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <i className="ri-user-follow-line text-2xl"></i>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg shadow-red-500/25">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Inactive Users</p>
              <p className="text-3xl font-bold">{(users || []).filter(u => !u?.is_active).length}</p>
              <p className="text-red-100 text-xs mt-1">Disabled accounts</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <i className="ri-user-unfollow-line text-2xl"></i>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg shadow-purple-500/25">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">New This Month</p>
              <p className="text-3xl font-bold">
                {users.filter(u => {
                  const userDate = new Date(u.created_at)
                  const currentDate = new Date()
                  return userDate.getMonth() === currentDate.getMonth() && 
                         userDate.getFullYear() === currentDate.getFullYear()
                }).length}
              </p>
              <p className="text-purple-100 text-xs mt-1">Recent signups</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <i className="ri-calendar-check-line text-2xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
        <div className="p-6 border-b border-gray-200/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
              <i className="ri-settings-3-line text-white"></i>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(users || []).map((user) => (
                <tr key={user?.id || 'unknown'} className="hover:bg-gray-50/80 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                          <span className="text-white font-semibold">
                            {user?.first_name?.charAt(0)?.toUpperCase() || 'U'}{user?.last_name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {user?.first_name || 'Unknown'} {user?.last_name || 'User'}
                        </div>
                        <div className="text-sm text-gray-500">ID: {user?.id || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user?.email || 'No email'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                      user.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      <i className={`mr-1 ${user.is_active ? 'ri-check-line' : 'ri-close-line'}`}></i>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="inline-flex items-center text-blue-600 hover:text-blue-900">
                        <i className="ri-edit-line mr-1"></i>
                        Edit
                      </button>
                      <button className="inline-flex items-center text-green-600 hover:text-green-900">
                        <i className="ri-eye-line mr-1"></i>
                        View
                      </button>
                      <button className={`inline-flex items-center ${user.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}>
                        <i className={`mr-1 ${user.is_active ? 'ri-user-unfollow-line' : 'ri-user-follow-line'}`}></i>
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Growth Chart */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
        <div className="p-6 border-b border-gray-200/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <i className="ri-line-chart-line text-white"></i>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">User Registration Timeline</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {users.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200/50">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <i className="ri-bar-chart-box-line text-white text-sm"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Registration Stats</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Today:</span>
                      <span className="text-sm font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                        {users.filter(u => {
                          const userDate = new Date(u.created_at).toDateString()
                          const today = new Date().toDateString()
                          return userDate === today
                        }).length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">This Week:</span>
                      <span className="text-sm font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                        {users.filter(u => {
                          const userDate = new Date(u.created_at)
                          const weekAgo = new Date()
                          weekAgo.setDate(weekAgo.getDate() - 7)
                          return userDate > weekAgo
                        }).length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">This Month:</span>
                      <span className="text-sm font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                        {users.filter(u => {
                          const userDate = new Date(u.created_at)
                          const currentDate = new Date()
                          return userDate.getMonth() === currentDate.getMonth() && 
                                 userDate.getFullYear() === currentDate.getFullYear()
                        }).length}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200/50">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <i className="ri-time-line text-white text-sm"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                  </div>
                  <div className="space-y-3">
                    {users.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-white/60 rounded-lg hover:bg-white/80 transition-colors duration-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center shadow-sm">
                            <span className="text-white text-xs font-semibold">
                              {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</span>
                        </div>
                        <span className="text-xs text-gray-600 font-medium">{new Date(user.created_at).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-user-line text-2xl text-gray-400"></i>
                </div>
                <p className="text-gray-500 text-lg">No users found</p>
                <p className="text-gray-400 text-sm">Users will appear here once they register</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
