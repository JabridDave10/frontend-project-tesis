'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Route, Truck, Users, ShoppingCart, TrendingUp, ArrowUpRight, Package, MapPin } from 'lucide-react'

const Map = dynamic(() => import('@/components/map/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] rounded-xl bg-slate-100 flex items-center justify-center">
      <div className="flex items-center gap-2 text-slate-400">
        <MapPin className="w-5 h-5 animate-pulse" />
        <span className="text-sm">Cargando mapa...</span>
      </div>
    </div>
  )
})

interface StatCard {
  title: string
  value: string
  change: string
  changeType: 'up' | 'down'
  icon: React.ReactNode
  gradient: string
}

export default function DashboardPage() {
  const [userName, setUserName] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          setUserName(user.first_name || 'Usuario')
        } catch { /* ignore */ }
      }
    }
  }, [])

  const stats: StatCard[] = [
    {
      title: 'Rutas Activas',
      value: '0',
      change: 'Nuevas hoy',
      changeType: 'up',
      icon: <Route className="w-5 h-5" />,
      gradient: 'from-blue-600 to-blue-400'
    },
    {
      title: 'Vehículos',
      value: '0',
      change: 'Disponibles',
      changeType: 'up',
      icon: <Truck className="w-5 h-5" />,
      gradient: 'from-cyan-600 to-cyan-400'
    },
    {
      title: 'Conductores',
      value: '0',
      change: 'Activos',
      changeType: 'up',
      icon: <Users className="w-5 h-5" />,
      gradient: 'from-emerald-600 to-emerald-400'
    },
    {
      title: 'Ventas del Mes',
      value: '$0',
      change: 'Este mes',
      changeType: 'up',
      icon: <ShoppingCart className="w-5 h-5" />,
      gradient: 'from-violet-600 to-violet-400'
    }
  ]

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0A1628] to-[#001F3F] p-8 text-white">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500 rounded-full mix-blend-screen blur-[80px] opacity-20" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <span className="text-cyan-300 text-sm font-medium">Panel de Control</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            Bienvenido, {userName}
          </h1>
          <p className="text-blue-200/70 text-sm max-w-md">
            Gestiona tus rutas, flota y operaciones desde un solo lugar. Selecciona una opción del menú para comenzar.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="bg-white rounded-xl border border-slate-200/60 p-5 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg`}>
                {stat.icon}
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-cyan-500 transition-colors" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.title}</p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100">
              <span className="text-xs text-emerald-600 font-medium">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Map + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Mapa de Vehículos</h2>
              <p className="text-xs text-slate-400 mt-0.5">Ubicación en tiempo real de la flota</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-cyan-600 font-mono bg-cyan-50 px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              EN VIVO
            </div>
          </div>
          <div className="p-4">
            <Map />
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-xl border border-slate-200/60 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Acciones Rápidas</h3>
          <div className="space-y-3">
            {[
              { label: 'Nueva Ruta', icon: <Route className="w-4 h-4" />, href: '/dashboard/rutas/agregar', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
              { label: 'Agregar Vehículo', icon: <Truck className="w-4 h-4" />, href: '/dashboard/camiones/agregar', color: 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100' },
              { label: 'Nuevo Conductor', icon: <Users className="w-4 h-4" />, href: '/dashboard/empleados/conductores/agregar', color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' },
              { label: 'Registrar Venta', icon: <ShoppingCart className="w-4 h-4" />, href: '/dashboard/ventas/agregar', color: 'bg-violet-50 text-violet-600 hover:bg-violet-100' },
              { label: 'Agregar Producto', icon: <Package className="w-4 h-4" />, href: '/dashboard/productos/agregar', color: 'bg-amber-50 text-amber-600 hover:bg-amber-100' },
              { label: 'Planificar Rutas', icon: <MapPin className="w-4 h-4" />, href: '/dashboard/planroutes', color: 'bg-rose-50 text-rose-600 hover:bg-rose-100' },
            ].map((action) => (
              <a
                key={action.label}
                href={action.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${action.color}`}
              >
                {action.icon}
                <span className="text-sm font-medium">{action.label}</span>
                <ArrowUpRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
