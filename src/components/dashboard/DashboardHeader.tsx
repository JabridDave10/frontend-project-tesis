'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AxiosUserManagement } from '@/services/axiosRegister'

interface DashboardHeaderProps {
  title: string
  showExportButton?: boolean
  showAddButton?: boolean
  onExport?: () => void
  onAdd?: () => void
  onMenuClick?: () => void
}

export const DashboardHeader = ({
  title,
  showExportButton = false,
  showAddButton = false,
  onExport,
  onAdd,
  onMenuClick
}: DashboardHeaderProps) => {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const userApi = new AxiosUserManagement()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await userApi.logoutUser()
      // Redirigir al login después del logout
      router.push('/auth/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Menu Button - Solo visible en móvil */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {showExportButton && (
          <button
            onClick={onExport}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Export CSV
          </button>
        )}
        {showAddButton && (
          <button
            onClick={onAdd}
            className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
          >
            Añadir Conductor
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Icon */}
        <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-sm text-gray-700">
            {isLoggingOut ? 'Cerrando sesión...' : 'Log out'}
          </span>
        </button>
      </div>
    </header>
  )
}
