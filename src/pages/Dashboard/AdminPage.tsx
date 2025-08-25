import React, { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Home, 
  Calendar,
  DollarSign,
  TrendingUp,
  MapPin,
  Star,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Filter,
  Download,
  FileText
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Link, useLocation } from 'react-router-dom';

const AdminCMSPage = React.lazy(() => import('./AdminCMSPage'));

const AdminPage: React.FC = () => {
  const { user } = useAuth()
  const location = useLocation();

  // Scroll to top when component mounts or tab changes
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  const stats = [
    { name: 'Total Users', value: '12,453', change: '+12%', icon: <Users className="h-6 w-6" /> },
    { name: 'Active Listings', value: '1,247', change: '+8%', icon: <Home className="h-6 w-6" /> },
    { name: 'Bookings This Month', value: '3,891', change: '+23%', icon: <Calendar className="h-6 w-6" /> },
    { name: 'Revenue', value: '$124,567', change: '+18%', icon: <DollarSign className="h-6 w-6" /> }
  ]

  const pendingActions = [
    { type: 'KYC Verification', count: 15, priority: 'high' },
    { type: 'Listing Approval', count: 8, priority: 'medium' },
    { type: 'Reported Issues', count: 3, priority: 'high' },
    { type: 'Host Applications', count: 12, priority: 'medium' }
  ]

  const recentBookings = [
    {
      id: '1',
      guest: 'Sarah Chen',
      listing: 'Traditional Newari House',
      host: 'Kamala Shakya',
      amount: '$135',
      status: 'confirmed',
      date: '2024-01-15'
    },
    {
      id: '2', 
      guest: 'Mark Johnson',
      listing: 'Lakeside Homestay',
      host: 'Binod Gurung',
      amount: '$105',
      status: 'pending',
      date: '2024-01-14'
    },
    {
      id: '3',
      guest: 'Emma Wilson',
      listing: 'Mountain Lodge',
      host: 'Pemba Sherpa',
      amount: '$160',
      status: 'confirmed',
      date: '2024-01-13'
    }
  ]

  const provinces = [
    { name: 'Bagmati', listings: 345, bookings: 892, revenue: '$34,567' },
    { name: 'Gandaki', listings: 234, bookings: 567, revenue: '$23,456' },
    { name: 'Province 1', listings: 123, bookings: 234, revenue: '$12,345' },
    { name: 'Lumbini', listings: 156, bookings: 345, revenue: '$15,678' }
  ]

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: <TrendingUp className="h-4 w-4" />, route: '/admin/dashboard' },
    { id: 'users', name: 'Users', icon: <Users className="h-4 w-4" />, route: '/admin/users' },
    { id: 'listings', name: 'Listings', icon: <Home className="h-4 w-4" />, route: '/admin/listings' },
    { id: 'verification', name: 'KYC', icon: <Shield className="h-4 w-4" />, route: '/admin/verification' },
    { id: 'analytics', name: 'Analytics', icon: <TrendingUp className="h-4 w-4" />, route: '/admin/analytics' },
    { id: 'cms', name: 'Content Management', icon: <FileText className="h-4 w-4" />, route: '/admin/cms' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your homestay platform</p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0 overflow-y-auto max-h-[80vh]">
            <div className="card p-4">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <Link
                    key={tab.id}
                    to={tab.route}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      location.pathname === tab.route
                        ? 'bg-nepal-red text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.name}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Dashboard Tab */}
            {location.pathname === '/admin/dashboard' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, index) => (
                    <div key={index} className="card p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">{stat.name}</p>
                          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                          <p className="text-sm text-green-600">{stat.change} from last month</p>
                        </div>
                        <div className="p-3 bg-nepal-red/10 rounded-full text-nepal-red">
                          {stat.icon}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pending Actions */}
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-heading font-semibold text-gray-900">
                      Pending Actions
                    </h3>
                    <button className="text-nepal-red hover:text-red-700 font-medium">
                      View All
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {pendingActions.map((action, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">{action.type}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            action.priority === 'high' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {action.priority}
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{action.count}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="card p-6">
                    <h3 className="text-lg font-heading font-semibold text-gray-900 mb-6">
                      Recent Bookings
                    </h3>
                    <div className="space-y-4">
                      {recentBookings.map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{booking.guest}</p>
                            <p className="text-sm text-gray-600">{booking.listing}</p>
                            <p className="text-xs text-gray-500">{booking.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{booking.amount}</p>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              booking.status === 'confirmed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="card p-6">
                    <h3 className="text-lg font-heading font-semibold text-gray-900 mb-6">
                      Province Overview
                    </h3>
                    <div className="space-y-4">
                      {provinces.map((province, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <MapPin className="h-4 w-4 text-gray-600" />
                            <span className="font-medium text-gray-900">{province.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">{province.listings} listings</p>
                            <p className="font-semibold text-gray-900">{province.revenue}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* CMS Tab */}
            {location.pathname === '/admin/cms' && (
              <Suspense fallback={<div className="text-center py-12">Loading CMS...</div>}>
                <AdminCMSPage />
              </Suspense>
            )}

            {/* KYC Verification Tab */}
            {location.pathname === '/admin/verification' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-heading font-semibold text-gray-900">
                      KYC Verification Queue
                    </h3>
                    <div className="flex items-center space-x-3">
                      <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                        <option>All Types</option>
                        <option>Identity Verification</option>
                        <option>Property Verification</option>
                        <option>Business License</option>
                      </select>
                      <button className="btn-secondary text-sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { name: 'Ram Bahadur', type: 'Identity', status: 'pending', submitted: '2024-01-15' },
                      { name: 'Maya Gurung', type: 'Property', status: 'review', submitted: '2024-01-14' },
                      { name: 'Pemba Sherpa', type: 'Business', status: 'pending', submitted: '2024-01-13' }
                    ].map((item, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                            <p className="text-sm text-gray-600">{item.type} Verification</p>
                            <p className="text-xs text-gray-500">Submitted: {item.submitted}</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              item.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {item.status}
                            </span>
                            <div className="flex space-x-2">
                              <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                <XCircle className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Analytics Tab */}
            {location.pathname === '/admin/analytics' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-heading font-semibold text-gray-900">
                    Analytics & Reports
                  </h3>
                  <button className="btn-primary flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Export Report</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="card p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Booking Trends</h4>
                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Chart placeholder - Booking trends over time</p>
                    </div>
                  </div>

                  <div className="card p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Revenue by Province</h4>
                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Chart placeholder - Revenue distribution</p>
                    </div>
                  </div>
                </div>

                <div className="card p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Key Metrics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-nepal-red">87%</p>
                      <p className="text-gray-600">Occupancy Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-nepal-blue">4.8</p>
                      <p className="text-gray-600">Average Rating</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-nepal-green">$156</p>
                      <p className="text-gray-600">Average Booking Value</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Test Tab */}
            {location.pathname === '/admin/test' && (
              <div className="p-8 text-center text-nepal-blue font-bold text-xl">Test Tab Content</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPage