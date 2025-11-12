'use client'

import { useState, useEffect, useCallback } from 'react'
import { GPSTrackingService, VehiclePosition } from '@/services/gpsTrackingService'

export const useGPSTracking = (vehicleId?: number) => {
  const [currentPosition, setCurrentPosition] = useState<VehiclePosition | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Event | null>(null)
  const trackingService = new GPSTrackingService()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handlePositionUpdate = (position: VehiclePosition) => {
      // Si se especifica un vehicleId, solo actualizar si coincide
      if (!vehicleId || position.id_vehicle === vehicleId) {
        setCurrentPosition(position)
      }
    }

    const handleError = (err: Event) => {
      setError(err)
      setIsConnected(false)
    }

    // Conectar al WebSocket
    trackingService.connect(handlePositionUpdate, handleError)

    // Suscribirse a un vehículo específico si se proporciona
    if (vehicleId) {
      trackingService.subscribeToVehicle(vehicleId)
    }

    setIsConnected(true)

    // Cleanup al desmontar
    return () => {
      trackingService.disconnect()
      setIsConnected(false)
    }
  }, [vehicleId])

  /**
   * Enviar posición GPS (desde app móvil)
   */
  const sendPosition = useCallback(
    (position: VehiclePosition) => {
      trackingService.sendPosition(position)
    },
    []
  )

  /**
   * Calcular progreso de ruta
   */
  const calculateProgress = useCallback(
    (routeCoordinates: [number, number][]): number => {
      if (!currentPosition || routeCoordinates.length === 0) return 0
      return trackingService.calculateRouteProgress(currentPosition, routeCoordinates)
    },
    [currentPosition]
  )

  return {
    currentPosition,
    isConnected,
    error,
    sendPosition,
    calculateProgress
  }
}

