'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Truck, Navigation, Gauge, Wifi, WifiOff,
  LogOut, Play, Square, Route, Loader2, AlertTriangle,
  Target, MapPin, Package, Clock, Ruler, CheckCircle2,
  ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react'
import { toast } from 'react-toastify'
import { GPSTrackingService } from '@/services/gpsTrackingService'
import { useGeolocation } from '@/hooks/useGeolocation'

interface DriverInfo {
  id_driver: number
  first_name: string
  last_name: string
  license_number: string
  status: string
}

interface RouteInfo {
  id_route: number
  route_code: string
  origin_address: string
  destination_address: string
  origin_latitude?: number
  origin_longitude?: number
  destination_latitude?: number
  destination_longitude?: number
  cargo_weight?: number
  cargo_volume?: number
  cargo_description?: string
  estimated_distance?: number
  estimated_duration?: number
  status: string
  notes?: string
  license_plate?: string
  vehicle_type?: string
  brand?: string
  model?: string
  id_vehicle?: number
  created_at?: string
}

interface AssignedVehicle {
  id_vehicle: number
  license_plate: string
  vehicle_type: string
  brand: string
  model: string
  year: number
  weight_capacity: number
  volume_capacity?: number
  status: string
  current_mileage: number
  photo?: string
}

const VEHICLE_EMOJIS: Record<string, string> = {
  moto: '🏍️',
  carro: '🚗',
  furgoneta: '🚐',
  camion: '🚛',
  camion_articulado: '🚚',
}

const VEHICLE_LABELS: Record<string, string> = {
  moto: 'Moto',
  carro: 'Carro',
  furgoneta: 'Furgoneta',
  camion: 'Camion',
  camion_articulado: 'Camion Articulado',
}

const VEHICLE_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  activo: { label: 'Activo', color: 'text-emerald-300 bg-emerald-400/20' },
  en_mantenimiento: { label: 'En Mantenimiento', color: 'text-amber-300 bg-amber-400/20' },
  inactivo: { label: 'Inactivo', color: 'text-slate-300 bg-slate-400/20' },
}

export default function ConductorTrackingPage() {
  const router = useRouter()
  const [driver, setDriver] = useState<DriverInfo | null>(null)
  const [activeRoute, setActiveRoute] = useState<RouteInfo | null>(null)
  const [pendingRoutes, setPendingRoutes] = useState<RouteInfo[]>([])
  const [assignedVehicle, setAssignedVehicle] = useState<AssignedVehicle | null>(null)
  const [driverError, setDriverError] = useState<string | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [wsConnected, setWsConnected] = useState(false)
  const [startingRouteId, setStartingRouteId] = useState<number | null>(null)
  const [completingRoute, setCompletingRoute] = useState(false)
  const [expandedRoute, setExpandedRoute] = useState<number | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const serviceRef = useRef<GPSTrackingService | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const {
    latitude,
    longitude,
    speed,
    heading,
    accuracy,
    error: geoError,
    permissionState,
    isSupported,
  } = useGeolocation(isTracking)

  const fetchDriverData = useCallback(async () => {
    try {
      const { api } = await import('@/services/api')
      const res = await api.get('/gps-tracking/driver/me')
      if (res.data?.driver) {
        setDriver(res.data.driver)
        localStorage.setItem('driver', JSON.stringify(res.data.driver))

        if (res.data.activeRoute) {
          setActiveRoute(res.data.activeRoute)
          localStorage.setItem('activeRoute', JSON.stringify(res.data.activeRoute))
        } else {
          setActiveRoute(null)
          localStorage.removeItem('activeRoute')
        }

        setPendingRoutes(res.data.pendingRoutes || [])

        if (res.data.assignedVehicle) {
          setAssignedVehicle(res.data.assignedVehicle)
          localStorage.setItem('assignedVehicle', JSON.stringify(res.data.assignedVehicle))
        }
      }
      return true
    } catch {
      return false
    }
  }, [])

  // Load driver info on mount
  useEffect(() => {
    const loadDriverInfo = async () => {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token')
      const userStr = localStorage.getItem('user')

      if (!token && !userStr) {
        router.push('/auth/login')
        return
      }

      // Always fetch fresh data from API
      try {
        const { api } = await import('@/services/api')
        const res = await api.get('/gps-tracking/driver/me')
        if (res.data?.driver) {
          setDriver(res.data.driver)
          localStorage.setItem('driver', JSON.stringify(res.data.driver))
          if (!localStorage.getItem('access_token') && localStorage.getItem('token')) {
            localStorage.setItem('access_token', localStorage.getItem('token')!)
          }
          if (res.data.activeRoute) {
            setActiveRoute(res.data.activeRoute)
            localStorage.setItem('activeRoute', JSON.stringify(res.data.activeRoute))
          }
          setPendingRoutes(res.data.pendingRoutes || [])
          if (res.data.assignedVehicle) {
            setAssignedVehicle(res.data.assignedVehicle)
            localStorage.setItem('assignedVehicle', JSON.stringify(res.data.assignedVehicle))
          }
          return
        }
        setDriverError('Tu cuenta no tiene perfil de conductor. Contacta al administrador.')
      } catch (error: any) {
        console.error('Error fetching driver info:', error)
        const status = error?.response?.status
        if (status === 404) {
          setDriverError('Tu cuenta no tiene perfil de conductor. Contacta al administrador.')
        } else if (status === 401 || status === 403) {
          router.push('/auth/login')
        } else {
          // Fallback to cached data
          const driverStr = localStorage.getItem('driver')
          if (driverStr) {
            try {
              setDriver(JSON.parse(driverStr))
              const routeStr = localStorage.getItem('activeRoute')
              if (routeStr) setActiveRoute(JSON.parse(routeStr))
              const vehicleStr = localStorage.getItem('assignedVehicle')
              if (vehicleStr) setAssignedVehicle(JSON.parse(vehicleStr))
            } catch { /* ignore */ }
          } else {
            setDriverError('Error al conectar con el servidor. Intenta de nuevo mas tarde.')
          }
        }
      }
    }

    loadDriverInfo()
  }, [router])

  // Fetch assigned vehicle when driver is loaded
  useEffect(() => {
    if (!driver) return

    const fetchVehicle = async () => {
      try {
        const { api } = await import('@/services/api')
        const res = await api.get(`/vehicles/by-driver/${driver.id_driver}`)
        const vehicles = Array.isArray(res.data) ? res.data : (res.data?.data || [])
        if (vehicles.length > 0) {
          setAssignedVehicle(vehicles[0])
          localStorage.setItem('assignedVehicle', JSON.stringify(vehicles[0]))
        }
      } catch (err) {
        console.warn('No se pudo obtener vehiculo asignado:', err)
      }
    }

    fetchVehicle()
  }, [driver])

  // Connect WebSocket when tracking starts
  useEffect(() => {
    if (!isTracking || !driver) return

    const token = localStorage.getItem('access_token') || localStorage.getItem('token')
    if (!token) return

    const service = new GPSTrackingService()
    serviceRef.current = service

    const socket = service.connect(token)

    socket.on('connect', () => {
      setWsConnected(true)
      service.registerDriver(driver.id_driver)
    })

    socket.on('disconnect', () => {
      setWsConnected(false)
    })

    socket.on('connect_error', () => {
      setWsConnected(false)
    })

    service.onRegistered(({ success }: { success: boolean }) => {
      if (success) {
        toast.success('Tracking GPS activado')
      }
    })

    service.onTrackingStopped(() => {
      toast.info('Tracking GPS detenido')
    })

    return () => {
      service.disconnect()
      serviceRef.current = null
      setWsConnected(false)
    }
  }, [isTracking, driver])

  // Send position every 5 seconds
  useEffect(() => {
    if (!isTracking || !driver || latitude === null || longitude === null) return

    const sendPosition = () => {
      serviceRef.current?.sendPosition({
        id_driver: driver.id_driver,
        latitude: latitude,
        longitude: longitude,
        speed: speed || 0,
        heading: heading || 0,
        accuracy: accuracy || 0,
        status: 'en_ruta',
        id_vehicle: activeRoute?.id_vehicle,
        id_route: activeRoute?.id_route,
      })
    }

    sendPosition()
    intervalRef.current = setInterval(sendPosition, 5000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isTracking, driver, latitude, longitude, speed, heading, accuracy, activeRoute])

  const handleStartTracking = useCallback(() => {
    if (!isSupported) {
      toast.error('Tu navegador no soporta GPS')
      return
    }
    setIsTracking(true)
  }, [isSupported])

  const handleStopTracking = useCallback(() => {
    if (driver) {
      serviceRef.current?.stopTracking(driver.id_driver)
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsTracking(false)
  }, [driver])

  const handleLogout = useCallback(() => {
    handleStopTracking()
    localStorage.removeItem('access_token')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('driver')
    localStorage.removeItem('activeRoute')
    localStorage.removeItem('assignedVehicle')
    router.push('/auth/login')
  }, [handleStopTracking, router])

  const handleStartRoute = async (routeId: number) => {
    setStartingRouteId(routeId)
    try {
      const { api } = await import('@/services/api')
      const res = await api.patch(`/gps-tracking/route/${routeId}/start`)
      if (res.data?.success) {
        toast.success('Ruta iniciada')
        await fetchDriverData()
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al iniciar la ruta')
    } finally {
      setStartingRouteId(null)
    }
  }

  const handleCompleteRoute = async () => {
    if (!activeRoute) return
    setCompletingRoute(true)
    try {
      const { api } = await import('@/services/api')
      const res = await api.patch(`/gps-tracking/route/${activeRoute.id_route}/complete`)
      if (res.data?.success) {
        toast.success('Ruta completada')
        handleStopTracking()
        await fetchDriverData()
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al completar la ruta')
    } finally {
      setCompletingRoute(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchDriverData()
    setRefreshing(false)
    toast.info('Datos actualizados')
  }

  if (driverError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-amber-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-white font-semibold text-lg mb-2">Sin perfil de conductor</h2>
          <p className="text-blue-300/70 text-sm mb-6">{driverError}</p>
          <button
            onClick={handleLogout}
            className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesion
          </button>
        </div>
      </div>
    )
  }

  if (!driver) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    )
  }

  const hasRoutes = activeRoute || pendingRoutes.length > 0

  return (
    <div className="min-h-screen p-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {driver.first_name[0]}{driver.last_name[0]}
          </div>
          <div>
            <h1 className="text-white font-semibold text-sm">
              {driver.first_name} {driver.last_name}
            </h1>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isTracking ? 'bg-cyan-400 animate-pulse' : 'bg-slate-400'}`} />
              <span className="text-xs text-blue-300/60">
                {isTracking ? 'Rastreando' : 'Inactivo'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 bg-white/10 rounded-xl text-blue-300/60 hover:text-white hover:bg-white/20 transition-all"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleLogout}
            className="p-2.5 bg-white/10 rounded-xl text-blue-300/60 hover:text-white hover:bg-white/20 transition-all"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Assigned Vehicle Card */}
      {assignedVehicle && (
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Truck className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-medium text-cyan-300">Vehiculo Asignado</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ml-auto ${VEHICLE_STATUS_LABELS[assignedVehicle.status]?.color || 'text-slate-300 bg-slate-400/20'}`}>
              {VEHICLE_STATUS_LABELS[assignedVehicle.status]?.label || assignedVehicle.status}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-2xl">
              {VEHICLE_EMOJIS[assignedVehicle.vehicle_type] || '🚗'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm">
                {assignedVehicle.brand} {assignedVehicle.model} ({assignedVehicle.year})
              </p>
              <p className="text-blue-300/70 text-xs">
                {VEHICLE_LABELS[assignedVehicle.vehicle_type] || assignedVehicle.vehicle_type} · {assignedVehicle.license_plate}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-blue-300/50">Capacidad</p>
              <p className="text-xs text-white">{assignedVehicle.weight_capacity} kg</p>
            </div>
            <div>
              <p className="text-[10px] text-blue-300/50">Kilometraje</p>
              <p className="text-xs text-white">{assignedVehicle.current_mileage?.toLocaleString() || 0} km</p>
            </div>
          </div>
        </div>
      )}

      {/* Active Route Card */}
      {activeRoute && (
        <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm rounded-2xl p-5 border border-cyan-400/30 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Route className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-cyan-300">Ruta en Progreso</span>
            <span className="text-xs bg-cyan-400/20 text-cyan-300 px-2 py-0.5 rounded-full ml-auto font-mono">
              {activeRoute.route_code}
            </span>
          </div>

          {/* Origin → Destination */}
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <span className="text-sm text-white/80">{activeRoute.origin_address}</span>
            </div>
            <div className="ml-1 border-l border-dashed border-white/20 h-3" />
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5 shrink-0" />
              <span className="text-sm text-white/80">{activeRoute.destination_address}</span>
            </div>
          </div>

          {/* Route details */}
          <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-2">
            {activeRoute.estimated_distance != null && (
              <div className="flex items-center gap-1.5">
                <Ruler className="w-3 h-3 text-blue-300/60" />
                <span className="text-xs text-blue-200">{Number(activeRoute.estimated_distance).toFixed(1)} km</span>
              </div>
            )}
            {activeRoute.estimated_duration != null && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-blue-300/60" />
                <span className="text-xs text-blue-200">{Math.round(Number(activeRoute.estimated_duration))} min</span>
              </div>
            )}
            {activeRoute.cargo_weight != null && (
              <div className="flex items-center gap-1.5">
                <Package className="w-3 h-3 text-blue-300/60" />
                <span className="text-xs text-blue-200">{Number(activeRoute.cargo_weight).toFixed(0)} kg</span>
              </div>
            )}
            {activeRoute.license_plate && (
              <div className="flex items-center gap-1.5">
                <Truck className="w-3 h-3 text-blue-300/60" />
                <span className="text-xs text-blue-200">{activeRoute.license_plate}</span>
              </div>
            )}
          </div>

          {/* Cargo description */}
          {activeRoute.cargo_description && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-[10px] text-blue-300/50 mb-1">Carga</p>
              <p className="text-xs text-white/70 leading-relaxed">{activeRoute.cargo_description}</p>
            </div>
          )}

          {/* Complete route button */}
          <button
            onClick={handleCompleteRoute}
            disabled={completingRoute}
            className="mt-4 w-full py-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-emerald-300 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {completingRoute ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Completando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Marcar como Completada
              </>
            )}
          </button>
        </div>
      )}

      {/* Pending Routes */}
      {pendingRoutes.length > 0 && (
        <div className="mb-4 space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-amber-300">
              {pendingRoutes.length} Ruta{pendingRoutes.length > 1 ? 's' : ''} Pendiente{pendingRoutes.length > 1 ? 's' : ''}
            </span>
          </div>

          {pendingRoutes.map(route => {
            const isExpanded = expandedRoute === route.id_route
            const isStarting = startingRouteId === route.id_route

            return (
              <div key={route.id_route} className="bg-white/10 backdrop-blur-sm rounded-2xl border border-amber-400/20 overflow-hidden">
                {/* Route header - always visible */}
                <button
                  onClick={() => setExpandedRoute(isExpanded ? null : route.id_route)}
                  className="w-full p-4 text-left flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-amber-400/20 rounded-xl flex items-center justify-center shrink-0">
                    <Route className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm">{route.route_code}</p>
                    <p className="text-blue-300/60 text-xs truncate">{route.destination_address}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-medium">
                      Pendiente
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-blue-300/60" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-blue-300/60" />
                    )}
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3">
                    {/* Origin → Destination */}
                    <div className="space-y-2 bg-white/5 rounded-xl p-3">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        <span className="text-xs text-white/80">{route.origin_address}</span>
                      </div>
                      <div className="ml-1 border-l border-dashed border-white/20 h-2" />
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5 shrink-0" />
                        <span className="text-xs text-white/80">{route.destination_address}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2">
                      {route.estimated_distance != null && (
                        <div className="bg-white/5 rounded-lg p-2.5 flex items-center gap-2">
                          <Ruler className="w-3.5 h-3.5 text-blue-300/60" />
                          <div>
                            <p className="text-[10px] text-blue-300/50">Distancia</p>
                            <p className="text-xs text-white font-medium">{Number(route.estimated_distance).toFixed(1)} km</p>
                          </div>
                        </div>
                      )}
                      {route.estimated_duration != null && (
                        <div className="bg-white/5 rounded-lg p-2.5 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-blue-300/60" />
                          <div>
                            <p className="text-[10px] text-blue-300/50">Duracion</p>
                            <p className="text-xs text-white font-medium">{Math.round(Number(route.estimated_duration))} min</p>
                          </div>
                        </div>
                      )}
                      {route.cargo_weight != null && (
                        <div className="bg-white/5 rounded-lg p-2.5 flex items-center gap-2">
                          <Package className="w-3.5 h-3.5 text-blue-300/60" />
                          <div>
                            <p className="text-[10px] text-blue-300/50">Peso</p>
                            <p className="text-xs text-white font-medium">{Number(route.cargo_weight).toFixed(0)} kg</p>
                          </div>
                        </div>
                      )}
                      {route.license_plate && (
                        <div className="bg-white/5 rounded-lg p-2.5 flex items-center gap-2">
                          <Truck className="w-3.5 h-3.5 text-blue-300/60" />
                          <div>
                            <p className="text-[10px] text-blue-300/50">Vehiculo</p>
                            <p className="text-xs text-white font-medium">{route.license_plate}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Cargo */}
                    {route.cargo_description && (
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-[10px] text-blue-300/50 mb-1">Carga a entregar</p>
                        <p className="text-xs text-white/70 leading-relaxed">{route.cargo_description}</p>
                      </div>
                    )}

                    {/* Notes */}
                    {route.notes && (
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-[10px] text-blue-300/50 mb-1">Notas</p>
                        <p className="text-xs text-white/70">{route.notes}</p>
                      </div>
                    )}

                    {/* Start route button */}
                    <button
                      onClick={() => handleStartRoute(route.id_route)}
                      disabled={isStarting || !!activeRoute}
                      className={`w-full py-3 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 ${
                        activeRoute
                          ? 'bg-white/5 text-blue-300/40 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-cyan-500/20'
                      }`}
                    >
                      {isStarting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Iniciando...
                        </>
                      ) : activeRoute ? (
                        'Completa la ruta activa primero'
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Iniciar esta Ruta
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* No routes message */}
      {!hasRoutes && (
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-4 text-center">
          <Route className="w-12 h-12 text-blue-300/30 mx-auto mb-3" />
          <p className="text-white/60 text-sm font-medium mb-1">Sin rutas asignadas</p>
          <p className="text-blue-300/40 text-xs">Cuando el planificador te asigne una ruta, aparecera aqui.</p>
        </div>
      )}

      {/* Live Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center">
          <Gauge className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-white">
            {speed !== null ? Math.round(speed) : '--'}
          </p>
          <p className="text-[10px] text-blue-300/60">km/h</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center">
          <Target className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-white">
            {accuracy !== null ? Math.round(accuracy) : '--'}
          </p>
          <p className="text-[10px] text-blue-300/60">m precision</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center">
          {wsConnected ? (
            <Wifi className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-400 mx-auto mb-1" />
          )}
          <p className="text-xl font-bold text-white">
            {wsConnected ? 'OK' : 'OFF'}
          </p>
          <p className="text-[10px] text-blue-300/60">conexion</p>
        </div>
      </div>

      {/* GPS Coordinates */}
      {isTracking && latitude !== null && longitude !== null && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Navigation className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-medium text-blue-200">Coordenadas</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-blue-300/50">Latitud</p>
              <p className="text-sm text-white font-mono">{latitude.toFixed(6)}</p>
            </div>
            <div>
              <p className="text-[10px] text-blue-300/50">Longitud</p>
              <p className="text-sm text-white font-mono">{longitude.toFixed(6)}</p>
            </div>
          </div>
        </div>
      )}

      {/* GPS Error */}
      {geoError && (
        <div className="bg-red-400/10 backdrop-blur-sm rounded-xl p-4 border border-red-400/20 mb-6 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <div>
            <p className="text-sm text-red-300 font-medium">Error GPS</p>
            <p className="text-xs text-red-300/70">{geoError}</p>
          </div>
        </div>
      )}

      {/* Permission denied warning */}
      {permissionState === 'denied' && (
        <div className="bg-amber-400/10 backdrop-blur-sm rounded-xl p-4 border border-amber-400/20 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-300 font-medium">Permiso denegado</span>
          </div>
          <p className="text-xs text-amber-300/70">
            Debes permitir el acceso a la ubicacion en la configuracion de tu navegador para usar el tracking GPS.
          </p>
        </div>
      )}

      {/* START / STOP Button */}
      <div className="mt-auto pt-4">
        {isTracking ? (
          <button
            onClick={handleStopTracking}
            className="w-full py-5 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold text-lg rounded-2xl shadow-lg shadow-red-500/20 hover:from-red-500 hover:to-red-400 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <Square className="w-6 h-6" />
            DETENER TRACKING
          </button>
        ) : (
          <button
            onClick={handleStartTracking}
            className="w-full py-5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-lg rounded-2xl shadow-lg shadow-cyan-500/20 hover:from-blue-500 hover:to-cyan-400 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <Play className="w-6 h-6" />
            INICIAR TRACKING
          </button>
        )}
      </div>
    </div>
  )
}
