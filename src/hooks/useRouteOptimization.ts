'use client'

import { useState } from 'react'
import { RouteOptimizationService } from '@/services/routeOptimizationService'
import { Cargo } from '@/types/cargoTypes'
import { Vehicle } from '@/types/vehicleTypes'
import { Driver } from '@/types/driverTypes'
import { OptimizedRoute } from '@/types/cargoTypes'

export const useRouteOptimization = () => {
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizedRoutes, setOptimizedRoutes] = useState<OptimizedRoute[]>([])
  const optimizationService = new RouteOptimizationService()

  /**
   * Optimizar asignación de cargas a vehículos
   */
  const optimizeRoutes = async (
    cargos: Cargo[],
    vehicles: Vehicle[],
    drivers: Driver[],
    origin: { lat: number; lng: number; address: string }
  ): Promise<OptimizedRoute[]> => {
    setIsOptimizing(true)
    try {
      const routes = await optimizationService.assignCargosToVehicles(
        cargos,
        vehicles,
        drivers,
        origin
      )
      setOptimizedRoutes(routes)
      return routes
    } catch (error) {
      console.error('Error al optimizar rutas:', error)
      return []
    } finally {
      setIsOptimizing(false)
    }
  }

  /**
   * Calcular ruta con múltiples paradas
   */
  const calculateMultiStopRoute = async (
    origin: [number, number],
    stops: Array<{ lat: number; lng: number }>
  ) => {
    return await optimizationService.calculateMultiStopRoute(origin, stops)
  }

  return {
    isOptimizing,
    optimizedRoutes,
    optimizeRoutes,
    calculateMultiStopRoute
  }
}

