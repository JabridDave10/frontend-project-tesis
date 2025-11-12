'use client'

import { useState } from 'react'
import { useRouteOptimization } from '@/hooks/useRouteOptimization'
import { CargoService } from '@/services/cargoService'
import { DriversService } from '@/services/driversService'
import { VehiclesService } from '@/services/vehiclesService'
import { Cargo } from '@/types/cargoTypes'
import { Vehicle } from '@/types/vehicleTypes'
import { Driver } from '@/types/driverTypes'
import { OptimizedRoute } from '@/types/cargoTypes'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import OptimizedRouteMap from '@/components/map/OptimizedRouteMap'
import { Loader2, Route, Truck } from 'lucide-react'

export const RouteOptimizationDemo = () => {
  const { isOptimizing, optimizedRoutes, optimizeRoutes } = useRouteOptimization()
  const [cargos, setCargos] = useState<Cargo[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [routes, setRoutes] = useState<OptimizedRoute[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const cargoService = new CargoService()
  const driversService = new DriversService()
  const vehiclesService = new VehiclesService()

  // Origen por defecto (Bogotá)
  const defaultOrigin = {
    lat: 4.711,
    lng: -74.072,
    address: 'Bogotá, Colombia'
  }

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [cargosData, vehiclesData, driversData] = await Promise.all([
        cargoService.getPendingCargos(),
        vehiclesService.getAvailableVehicles(),
        driversService.getAvailableDrivers()
      ])

      setCargos(cargosData)
      setVehicles(vehiclesData)
      setDrivers(driversData)
    } catch (error) {
      console.error('Error al cargar datos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOptimize = async () => {
    if (cargos.length === 0) {
      alert('No hay cargas pendientes para optimizar')
      return
    }

    if (vehicles.length === 0) {
      alert('No hay vehículos disponibles')
      return
    }

    if (drivers.length === 0) {
      alert('No hay conductores disponibles')
      return
    }

    const optimized = await optimizeRoutes(cargos, vehicles, drivers, defaultOrigin)
    setRoutes(optimized)
  }

  return (
    <div className="p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Optimización de Rutas
          </CardTitle>
          <CardDescription>
            Asigna cargas a vehículos y optimiza las rutas automáticamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Estadísticas */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Cargas Pendientes</p>
              <p className="text-2xl font-bold text-blue-600">{cargos.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Vehículos Disponibles</p>
              <p className="text-2xl font-bold text-green-600">{vehicles.length}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Conductores Disponibles</p>
              <p className="text-2xl font-bold text-purple-600">{drivers.length}</p>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2">
            <Button
              onClick={loadData}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cargando...
                </>
              ) : (
                'Cargar Datos'
              )}
            </Button>
            <Button
              onClick={handleOptimize}
              disabled={isOptimizing || cargos.length === 0 || vehicles.length === 0 || drivers.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isOptimizing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Optimizando...
                </>
              ) : (
                <>
                  <Truck className="h-4 w-4 mr-2" />
                  Optimizar Rutas
                </>
              )}
            </Button>
          </div>

          {/* Información de rutas optimizadas */}
          {routes.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">
                Rutas Optimizadas: {routes.length}
              </h3>
              <div className="space-y-2">
                {routes.map((route, index) => (
                  <div key={route.route_code} className="bg-white p-3 rounded border">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{route.route_code}</span>
                      <span className="text-xs text-gray-500">{route.status}</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1 grid grid-cols-2 gap-2">
                      <p>Vehículo: {route.assignments[0]?.vehicle.license_plate}</p>
                      <p>Conductor: {route.assignments[0]?.driver.first_name} {route.assignments[0]?.driver.last_name}</p>
                      <p>Paradas: {route.assignments.length}</p>
                      <p>Distancia: {route.total_distance.toFixed(2)} km</p>
                      <p>Duración: {route.total_duration.toFixed(0)} min</p>
                      <p>Peso: {route.total_weight.toFixed(2)} kg</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mapa con rutas optimizadas */}
      {routes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mapa de Rutas Optimizadas</CardTitle>
            <CardDescription>
              Visualización de las rutas optimizadas en el mapa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OptimizedRouteMap routes={routes} showVehicleTracking={false} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

