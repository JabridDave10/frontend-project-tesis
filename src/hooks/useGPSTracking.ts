'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { GPSTrackingService, VehiclePosition } from '@/services/gpsTrackingService'

interface UseGPSTrackingOptions {
  mode: 'dashboard' | 'driver'
  driverId?: number
}

export const useGPSTracking = (options: UseGPSTrackingOptions = { mode: 'dashboard' }) => {
  const [driverPositions, setDriverPositions] = useState<Map<number, VehiclePosition>>(new Map())
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const serviceRef = useRef<GPSTrackingService | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const token = localStorage.getItem('access_token')
    if (!token) {
      setError('No authentication token found')
      return
    }

    const service = new GPSTrackingService()
    serviceRef.current = service

    try {
      const socket = service.connect(token)

      socket.on('connect', () => {
        setIsConnected(true)
        setError(null)

        if (options.mode === 'dashboard') {
          service.subscribeToDashboard()
        } else if (options.mode === 'driver' && options.driverId) {
          service.registerDriver(options.driverId)
        }
      })

      socket.on('disconnect', () => {
        setIsConnected(false)
      })

      socket.on('connect_error', (err) => {
        setError(err.message)
        setIsConnected(false)
      })

      if (options.mode === 'dashboard') {
        service.onActiveDrivers((drivers) => {
          const newMap = new Map<number, VehiclePosition>()
          drivers.forEach((d) => newMap.set(d.id_driver, d))
          setDriverPositions(newMap)
        })

        service.onVehiclePosition((position) => {
          setDriverPositions((prev) => {
            const newMap = new Map(prev)
            newMap.set(position.id_driver, position)
            return newMap
          })
        })

        service.onDriverOffline(({ id_driver }) => {
          setDriverPositions((prev) => {
            const newMap = new Map(prev)
            newMap.delete(id_driver)
            return newMap
          })
        })
      }
    } catch (err: any) {
      setError(err.message || 'Connection failed')
    }

    return () => {
      service.disconnect()
      serviceRef.current = null
    }
  }, [options.mode, options.driverId])

  const sendPosition = useCallback(
    (data: {
      id_driver: number
      latitude: number
      longitude: number
      speed?: number
      heading?: number
      accuracy?: number
      status?: string
      id_vehicle?: number
      id_route?: number
    }) => {
      serviceRef.current?.sendPosition(data)
    },
    [],
  )

  const stopTracking = useCallback((driverId: number) => {
    serviceRef.current?.stopTracking(driverId)
  }, [])

  return {
    driverPositions,
    isConnected,
    error,
    sendPosition,
    stopTracking,
    driversArray: Array.from(driverPositions.values()),
  }
}
