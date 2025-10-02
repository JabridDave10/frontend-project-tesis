'use client'

import { useState, useEffect } from 'react'
import { RoutesService } from '@/services/routesService'
import { Route } from '@/types/routeTypes'
import { useRouter } from 'next/navigation'

export const RoutesListView = () => {
  const [routes, setRoutes] = useState<Route[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const router = useRouter()
  const routesService = new RoutesService()

  useEffect(() => {
    loadRoutes()
  }, [])

  const loadRoutes = async () => {
    setIsLoading(true)
    const data = await routesService.getAllRoutes()
    setRoutes(data)
    setIsLoading(false)
  }

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar esta ruta?')) {
      const success = await routesService.deleteRoute(id)
      if (success) {
        loadRoutes()
      }
    }
  }

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    const success = await routesService.updateRouteStatus(id, newStatus)
    if (success) {
      loadRoutes()
    }
  }

  const filteredRoutes = routes.filter(route => {
    const matchesSearch =
      route.route_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.origin_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.destination_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.driver_first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.vehicle_plate?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === 'all' || route.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      en_progreso: 'bg-blue-100 text-blue-800',
      completada: 'bg-green-100 text-green-800',
      cancelada: 'bg-red-100 text-red-800'
    }
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No programada'
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Rutas</h1>
        <button
          onClick={() => router.push('/dashboard/rutas/agregar')}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Crear Nueva Ruta
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Buscar por código, dirección, conductor o vehículo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          <option value="all">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_progreso">En Progreso</option>
          <option value="completada">Completada</option>
          <option value="cancelada">Cancelada</option>
        </select>
      </div>

      {/* Routes Grid */}
      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Cargando rutas...</div>
        ) : filteredRoutes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No hay rutas registradas</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
            {filteredRoutes.map((route) => (
              <div
                key={route.id_route}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{route.route_code}</h3>
                    <p className="text-xs text-gray-500">{formatDate(route.scheduled_date)}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(route.status)}`}>
                    {route.status}
                  </span>
                </div>

                {/* Route Info */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <circle cx="10" cy="10" r="8"/>
                    </svg>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Origen</p>
                      <p className="text-sm text-gray-900">{route.origin_address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"/>
                    </svg>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Destino</p>
                      <p className="text-sm text-gray-900">{route.destination_address}</p>
                    </div>
                  </div>
                </div>

                {/* Cargo & Assignment */}
                <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                  <div>
                    <p className="text-gray-500">Carga</p>
                    <p className="font-medium text-gray-900">{route.cargo_weight} kg</p>
                  </div>
                  {route.estimated_distance && (
                    <div>
                      <p className="text-gray-500">Distancia</p>
                      <p className="font-medium text-gray-900">{route.estimated_distance} km</p>
                    </div>
                  )}
                  {route.driver_first_name && (
                    <div>
                      <p className="text-gray-500">Conductor</p>
                      <p className="font-medium text-gray-900">{route.driver_first_name} {route.driver_last_name}</p>
                    </div>
                  )}
                  {route.vehicle_plate && (
                    <div>
                      <p className="text-gray-500">Vehículo</p>
                      <p className="font-medium text-gray-900">{route.vehicle_plate}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  {route.status === 'pendiente' && (
                    <button
                      onClick={() => handleUpdateStatus(route.id_route, 'en_progreso')}
                      className="flex-1 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      Iniciar
                    </button>
                  )}
                  {route.status === 'en_progreso' && (
                    <button
                      onClick={() => handleUpdateStatus(route.id_route, 'completada')}
                      className="flex-1 px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    >
                      Completar
                    </button>
                  )}
                  <button
                    onClick={() => router.push(`/dashboard/rutas/editar/${route.id_route}`)}
                    className="flex-1 px-3 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(route.id_route)}
                    className="flex-1 px-3 py-1 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
