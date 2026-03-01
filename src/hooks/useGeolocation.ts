'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  speed: number | null
  heading: number | null
  accuracy: number | null
  timestamp: number | null
  error: string | null
  permissionState: 'prompt' | 'granted' | 'denied' | 'unknown'
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean
  maximumAge?: number
  timeout?: number
}

export const useGeolocation = (
  active: boolean = false,
  options: UseGeolocationOptions = {}
) => {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    speed: null,
    heading: null,
    accuracy: null,
    timestamp: null,
    error: null,
    permissionState: 'unknown',
  })

  const watchIdRef = useRef<number | null>(null)

  // Check permission state
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.permissions) return

    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      setState(prev => ({ ...prev, permissionState: result.state as any }))
      result.onchange = () => {
        setState(prev => ({ ...prev, permissionState: result.state as any }))
      }
    }).catch(() => {
      // permissions API not fully supported
    })
  }, [])

  // Watch position
  useEffect(() => {
    if (!active || typeof navigator === 'undefined' || !navigator.geolocation) {
      return
    }

    const onSuccess = (position: GeolocationPosition) => {
      setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        speed: position.coords.speed !== null ? position.coords.speed * 3.6 : null, // m/s -> km/h
        heading: position.coords.heading,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
        error: null,
        permissionState: 'granted',
      })
    }

    const onError = (error: GeolocationPositionError) => {
      let errorMsg = 'Error desconocido de GPS'
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMsg = 'Permiso de ubicacion denegado'
          break
        case error.POSITION_UNAVAILABLE:
          errorMsg = 'Ubicacion no disponible'
          break
        case error.TIMEOUT:
          errorMsg = 'Tiempo de espera agotado para GPS'
          break
      }
      setState(prev => ({
        ...prev,
        error: errorMsg,
        permissionState: error.code === error.PERMISSION_DENIED ? 'denied' : prev.permissionState,
      }))
    }

    const watchOptions: PositionOptions = {
      enableHighAccuracy: options.enableHighAccuracy ?? true,
      maximumAge: options.maximumAge ?? 5000,
      timeout: options.timeout ?? 15000,
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      onSuccess,
      onError,
      watchOptions,
    )

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
    }
  }, [active, options.enableHighAccuracy, options.maximumAge, options.timeout])

  const requestPermission = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      () => setState(prev => ({ ...prev, permissionState: 'granted' })),
      () => setState(prev => ({ ...prev, permissionState: 'denied' })),
    )
  }, [])

  return {
    ...state,
    requestPermission,
    isSupported: typeof navigator !== 'undefined' && 'geolocation' in navigator,
  }
}
