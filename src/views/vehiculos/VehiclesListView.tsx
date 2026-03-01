'use client'

import { useState, useEffect } from 'react'
import { VehiclesService } from '@/services/vehiclesService'
import { Vehicle, VEHICLE_TYPE_LABELS } from '@/types/vehicleTypes'
import { useRouter } from 'next/navigation'
import { Plus, Search, Pencil, Trash2, Truck } from 'lucide-react'

export const VehiclesListView = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()
  const vehiclesService = new VehiclesService()

  useEffect(() => {
    loadVehicles()
  }, [])

  const loadVehicles = async () => {
    setIsLoading(true)
    const data = await vehiclesService.getAllVehicles()
    setVehicles(data)
    setIsLoading(false)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Estas seguro de eliminar este vehiculo?')) {
      const success = await vehiclesService.deleteVehicle(id)
      if (success) {
        loadVehicles()
      }
    }
  }

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      activo: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      en_mantenimiento: 'bg-amber-50 text-amber-700 border-amber-200',
      inactivo: 'bg-slate-100 text-slate-500 border-slate-200'
    }
    const labels: Record<string, string> = {
      activo: 'Activo',
      en_mantenimiento: 'Mantenimiento',
      inactivo: 'Inactivo'
    }
    return {
      className: styles[status] || styles.inactivo,
      label: labels[status] || status
    }
  }

  const getVehicleTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      moto: '🏍️',
      carro: '🚗',
      furgoneta: '🚐',
      camion: '🚛',
      camion_articulado: '🚚'
    }
    return icons[type] || '🚗'
  }

  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Vehiculos</h1>
          <p className="text-slate-500 text-sm mt-1">{vehicles.length} vehiculo{vehicles.length !== 1 ? 's' : ''} registrado{vehicles.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/vehiculos/agregar')}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Agregar Vehiculo
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por matricula, marca o modelo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-800 placeholder:text-slate-400 shadow-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500">Cargando vehiculos...</p>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Truck className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-700 mb-1">No hay vehiculos</h3>
            <p className="text-slate-500 text-sm mb-4">
              {searchTerm ? 'No se encontraron resultados para tu busqueda' : 'Agrega tu primer vehiculo para comenzar'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => router.push('/dashboard/vehiculos/agregar')}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all"
              >
                Agregar Vehiculo
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/60">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Matricula</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Marca / Modelo</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ano</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Capacidad</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Conductor</th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVehicles.map((vehicle) => {
                  const status = getStatusBadge(vehicle.status)
                  return (
                    <tr key={vehicle.id_vehicle} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-slate-800">{vehicle.license_plate}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg">
                          <span>{getVehicleTypeIcon(vehicle.vehicle_type)}</span>
                          {VEHICLE_TYPE_LABELS[vehicle.vehicle_type] || vehicle.vehicle_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-800">{vehicle.brand}</div>
                        <div className="text-xs text-slate-500">{vehicle.model}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-700">{vehicle.year}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-800">{vehicle.weight_capacity} kg</div>
                        {vehicle.volume_capacity ? (
                          <div className="text-xs text-slate-500">{vehicle.volume_capacity} m3</div>
                        ) : null}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-lg border ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {vehicle.driver_first_name ? (
                          <span className="text-sm text-slate-700">{vehicle.driver_first_name} {vehicle.driver_last_name}</span>
                        ) : (
                          <span className="text-sm text-slate-400 italic">Sin asignar</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => router.push(`/dashboard/vehiculos/editar/${vehicle.id_vehicle}`)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(vehicle.id_vehicle)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
