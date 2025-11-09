'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RoutesService } from '@/services/routesService'
import { DriversService } from '@/services/driversService'
import { VehiclesService } from '@/services/vehiclesService'
import { CreateRouteDto } from '@/types/routeTypes'
import { Driver } from '@/types/driverTypes'
import { Vehicle } from '@/types/vehicleTypes'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export const AddRouteView = () => {
  const router = useRouter()
  const routesService = new RoutesService()
  const driversService = new DriversService()
  const vehiclesService = new VehiclesService()

  const [isLoading, setIsLoading] = useState(false)
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])

  const [routeData, setRouteData] = useState<CreateRouteDto>({
    route_code: `ROUTE-${Date.now()}`,
    id_driver: undefined,
    id_vehicle: undefined,
    origin_address: '',
    origin_latitude: undefined,
    origin_longitude: undefined,
    destination_address: '',
    destination_latitude: undefined,
    destination_longitude: undefined,
    cargo_weight: 0,
    cargo_volume: undefined,
    cargo_description: '',
    status: 'pendiente',
    estimated_distance: undefined,
    estimated_duration: undefined,
    estimated_cost: undefined,
    scheduled_date: '',
    notes: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [driversData, vehiclesData] = await Promise.all([
      driversService.getAvailableDrivers(),
      vehiclesService.getAvailableVehicles()
    ])
    setDrivers(driversData)
    setVehicles(vehiclesData)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setRouteData(prev => ({
      ...prev,
      [name]: [
        'cargo_weight',
        'cargo_volume',
        'estimated_distance',
        'estimated_duration',
        'estimated_cost',
        'origin_latitude',
        'origin_longitude',
        'destination_latitude',
        'destination_longitude'
      ].includes(name)
        ? parseFloat(value) || undefined
        : ['id_driver', 'id_vehicle'].includes(name)
        ? value ? parseInt(value) : undefined
        : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await routesService.createRoute(routeData)
      if (result) {
        router.push('/dashboard/rutas')
      }
    } catch (error) {
      console.error('Error al crear ruta:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Crear Nueva Ruta</h1>
          <p className="text-gray-600">Complete la información de la ruta/envío</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Código de Ruta */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Información General</h2>
              <Input
                type="text"
                name="route_code"
                value={routeData.route_code}
                onChange={handleInputChange}
                placeholder="Código de Ruta *"
                required
              />
            </div>

            {/* Dirección de Origen */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Origen</h2>
              <div className="space-y-4">
                <Input
                  type="text"
                  name="origin_address"
                  value={routeData.origin_address}
                  onChange={handleInputChange}
                  placeholder="Dirección de Origen *"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    name="origin_latitude"
                    step="0.0000001"
                    value={routeData.origin_latitude?.toString() || ''}
                    onChange={handleInputChange}
                    placeholder="Latitud (Opcional)"
                  />
                  <Input
                    type="number"
                    name="origin_longitude"
                    step="0.0000001"
                    value={routeData.origin_longitude?.toString() || ''}
                    onChange={handleInputChange}
                    placeholder="Longitud (Opcional)"
                  />
                </div>
              </div>
            </div>

            {/* Dirección de Destino */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Destino</h2>
              <div className="space-y-4">
                <Input
                  type="text"
                  name="destination_address"
                  value={routeData.destination_address}
                  onChange={handleInputChange}
                  placeholder="Dirección de Destino *"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    name="destination_latitude"
                    step="0.0000001"
                    value={routeData.destination_latitude?.toString() || ''}
                    onChange={handleInputChange}
                    placeholder="Latitud (Opcional)"
                  />
                  <Input
                    type="number"
                    name="destination_longitude"
                    step="0.0000001"
                    value={routeData.destination_longitude?.toString() || ''}
                    onChange={handleInputChange}
                    placeholder="Longitud (Opcional)"
                  />
                </div>
              </div>
            </div>

            {/* Información de la Carga */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Información de la Carga</h2>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  name="cargo_weight"
                  value={routeData.cargo_weight.toString()}
                  onChange={handleInputChange}
                  placeholder="Peso de la Carga (kg) *"
                  required
                />
                <Input
                  type="number"
                  name="cargo_volume"
                  value={routeData.cargo_volume?.toString() || ''}
                  onChange={handleInputChange}
                  placeholder="Volumen (m³)"
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción de la Carga
                </label>
                <textarea
                  name="cargo_description"
                  value={routeData.cargo_description}
                  onChange={handleInputChange}
                  placeholder="Describe la carga (electrodomésticos, muebles, etc.)..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-800 placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Asignación */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Asignación</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conductor
                  </label>
                  <select
                    name="id_driver"
                    value={routeData.id_driver || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-800"
                  >
                    <option value="">Sin asignar</option>
                    {drivers.map((driver) => (
                      <option key={driver.id_driver} value={driver.id_driver}>
                        {driver.first_name} {driver.last_name} - {driver.license_type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehículo
                  </label>
                  <select
                    name="id_vehicle"
                    value={routeData.id_vehicle || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-800"
                  >
                    <option value="">Sin asignar</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id_vehicle} value={vehicle.id_vehicle}>
                        {vehicle.license_plate} - {vehicle.brand} {vehicle.model} ({vehicle.weight_capacity}kg)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Planificación */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Planificación</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha Programada
                  </label>
                  <Input
                    type="datetime-local"
                    name="scheduled_date"
                    value={routeData.scheduled_date || ''}
                    onChange={handleInputChange}
                    placeholder="Fecha Programada"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    name="status"
                    value={routeData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-800"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_progreso">En Progreso</option>
                    <option value="completada">Completada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>

                <Input
                  type="number"
                  name="estimated_distance"
                  value={routeData.estimated_distance?.toString() || ''}
                  onChange={handleInputChange}
                  placeholder="Distancia Estimada (km)"
                />

                <Input
                  type="number"
                  name="estimated_duration"
                  value={routeData.estimated_duration?.toString() || ''}
                  onChange={handleInputChange}
                  placeholder="Duración Estimada (minutos)"
                />

                <Input
                  type="number"
                  name="estimated_cost"
                  value={routeData.estimated_cost?.toString() || ''}
                  onChange={handleInputChange}
                  placeholder="Costo Estimado ($)"
                />
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas Adicionales
              </label>
              <textarea
                name="notes"
                value={routeData.notes}
                onChange={handleInputChange}
                placeholder="Observaciones, instrucciones especiales, etc..."
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-800 placeholder:text-gray-400"
              />
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/dashboard/rutas')}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Creando Ruta...' : 'Crear Ruta'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
