'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AxiosUserManagement } from '@/services/axiosRegister'
import { Bell, LogOut, Menu, Search } from 'lucide-react'

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
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState('Usuario')
  const userApi = new AxiosUserManagement()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          setUserName(`${user.first_name || ''} ${user.last_name || ''}`.trim())
          const roleLabels: Record<number, string> = { 1: 'Administrador', 2: 'Conductor', 3: 'Operador' }
          setUserRole(roleLabels[user.id_role] || 'Usuario')
        } catch { /* ignore */ }
      }
    }
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await userApi.logoutUser()
      router.push('/auth/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const initials = userName
    ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-4 lg:px-8 py-3 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
        )}

        {/* Search bar */}
        <div className="hidden md:flex items-center gap-2 bg-slate-100 rounded-xl px-4 py-2 w-72">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar..."
            className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none w-full"
          />
        </div>

        {showExportButton && (
          <button
            onClick={onExport}
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Export CSV
          </button>
        )}
        {showAddButton && (
          <button
            onClick={onAdd}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-cyan-600 transition-all shadow-sm"
          >
            Añadir
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button className="relative p-2.5 hover:bg-slate-100 rounded-xl transition-colors">
          <Bell className="w-5 h-5 text-slate-500" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-cyan-500 rounded-full ring-2 ring-white" />
        </button>

        {/* Divider */}
        <div className="h-8 w-px bg-slate-200" />

        {/* User profile + logout */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0A1628] to-[#001F3F] flex items-center justify-center shadow-sm">
            <span className="text-xs font-bold text-cyan-300">{initials}</span>
          </div>
          <div className="hidden lg:flex flex-col">
            <span className="text-sm font-medium text-slate-800">{userName || 'Usuario'}</span>
            <span className="text-[11px] text-slate-400">{userRole}</span>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors group disabled:opacity-50"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors" />
          </button>
        </div>
      </div>
    </header>
  )
}
