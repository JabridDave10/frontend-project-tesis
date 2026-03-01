'use client'

import { useState, useEffect } from 'react'
import { DriversService } from '@/services/driversService'
import { Driver } from '@/types/driverTypes'
import { useRouter } from 'next/navigation'
import { Users, Plus, Search, Pencil, Trash2, Truck } from 'lucide-react'

export const DriversListView = () => {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()
  const driversService = new DriversService()

  useEffect(() => {
    loadDrivers()
  }, [])

  const loadDrivers = async () => {
    setIsLoading(true)
    const data = await driversService.getAllDrivers()
    setDrivers(data)
    setIsLoading(false)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Estas seguro de eliminar este conductor?')) {
      const success = await driversService.deleteDriver(id)
      if (success) {
        loadDrivers()
      }
    }
  }

  const filteredDrivers = drivers.filter(driver =>
    driver.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.license_number.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      disponible: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      en_ruta: 'bg-blue-50 text-blue-700 border-blue-200/60',
      descanso: 'bg-amber-50 text-amber-700 border-amber-200/60',
      inactivo: 'bg-slate-50 text-slate-600 border-slate-200/60'
    }
    return statusStyles[status as keyof typeof statusStyles] || 'bg-slate-50 text-slate-600 border-slate-200/60'
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      disponible: 'Disponible',
      en_ruta: 'En Ruta',
      descanso: 'Descanso',
      inactivo: 'Inactivo'
    }
    return labels[status as keyof typeof labels] || status
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Banner header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0A1628] to-[#001F3F] p-8 text-white">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500 rounded-full mix-blend-screen blur-[80px] opacity-20" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-300 text-sm font-medium">Gestion de Personal</span>
            </div>
            <h1 className="text-3xl font-bold">Conductores</h1>
            <p className="text-blue-200/70 text-sm mt-1">{drivers.length} conductores registrados</p>
          </div>
          <button
            onClick={() => router.push('/dashboard/empleados/conductores/agregar')}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium rounded-xl hover:from-blue-500 hover:to-cyan-400 transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Agregar Conductor
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o numero de licencia..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white rounded-xl border border-slate-200/60 shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all"
        />
      </div>

      {/* Drivers Table */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">Cargando conductores...</p>
          </div>
        ) : filteredDrivers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-lg font-medium text-slate-700 mb-1">No hay conductores registrados</p>
            <p className="text-sm text-slate-400 mb-4">Comienza agregando tu primer conductor</p>
            <button
              onClick={() => router.push('/dashboard/empleados/conductores/agregar')}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium rounded-xl hover:from-blue-500 hover:to-cyan-400 transition-all shadow-lg shadow-blue-500/20 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Agregar Conductor
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/80 border-b border-slate-200/60">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Licencia
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Categorias
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Autoridad
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDrivers.map((driver) => (
                  <tr key={driver.id_driver} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                          {(driver.first_name?.[0] || '')}{(driver.last_name?.[0] || '')}
                        </div>
                        <span className="text-sm font-medium text-slate-900">
                          {driver.first_name} {driver.last_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-700 font-mono">{driver.license_number}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-600">{Array.isArray(driver.license_categories) ? driver.license_categories.join(', ') : driver.license_categories || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-600">{driver.license_issuing_authority || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs font-medium rounded-full border ${getStatusBadge(driver.status)}`}>
                        {getStatusLabel(driver.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-700">{driver.email}</div>
                      <div className="text-xs text-slate-400">{driver.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/dashboard/empleados/conductores/editar/${driver.id_driver}`)}
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(driver.id_driver)}
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
