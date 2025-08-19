'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import {
  Home,
  Upload,
  BookOpen,
  BarChart3,
  Settings,
  Menu,
  X,
  User,
  Bell,
  LogOut,
  Sparkles,
  Crown,
  FileText
} from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Upload', href: '/upload', icon: Upload },
  { name: 'Practice', href: '/practice', icon: BookOpen, badge: 'New' },
  { name: 'Results', href: '/results', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-semibold text-gray-900">Exam Prep</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-2 px-3 py-6">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'nav-link-active shadow-soft'
                      : 'nav-link'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="flex items-center">
                    <item.icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 ${
                        isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-500'
                      }`}
                    />
                    {item.name}
                  </div>
                  {item.badge && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white/80 backdrop-blur-lg border-r border-gray-200/50">
          <div className="flex h-20 items-center px-6 border-b border-gray-200/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient">ExamPrep</h1>
                <div className="flex items-center space-x-1">
                  <Crown className="w-3 h-3 text-primary-500" />
                  <span className="text-xs text-primary-600 font-medium">{user?.role}</span>
                </div>
              </div>
            </div>
          </div>
          <nav className="flex-1 space-y-2 px-3 py-6">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'nav-link-active shadow-soft'
                      : 'nav-link'
                  }`}
                >
                  <div className="flex items-center">
                    <item.icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 ${
                        isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-500'
                      }`}
                    />
                    {item.name}
                  </div>
                  {item.badge && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <div className="sticky top-0 z-40 flex h-20 shrink-0 items-center gap-x-4 border-b border-gray-200/50 bg-white/80 backdrop-blur-lg px-6 shadow-soft sm:gap-x-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden hover:text-primary-600 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Role Indicator */}
              <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-primary-100 to-primary-200 rounded-full">
                <Crown className="w-4 h-4 text-primary-600" />
                <span className="text-xs font-medium text-primary-700">{user?.role}</span>
              </div>
              
              {/* Notifications */}
              <button className="relative p-3 text-gray-400 hover:text-primary-600 transition-colors rounded-xl hover:bg-primary-50">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full bg-error-500 animate-pulse"></span>
              </button>

              {/* Profile dropdown */}
              <div className="relative">
                <button className="flex items-center gap-x-3 text-sm font-medium text-gray-900 hover:text-primary-600 transition-colors p-2 rounded-xl hover:bg-primary-50">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={`${user.firstName} ${user.lastName}`}
                      className="h-10 w-10 rounded-full border-2 border-primary-200"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center border-2 border-primary-200">
                      <User className="h-5 w-5 text-primary-600" />
                    </div>
                  )}
                  <div className="hidden lg:block text-left">
                    <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </button>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-3 text-gray-400 hover:text-error-600 transition-colors rounded-xl hover:bg-error-50"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-8 px-6">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
