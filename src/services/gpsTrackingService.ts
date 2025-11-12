/**
 * Servicio para seguimiento GPS en tiempo real
 * Preparado para integración con WebSockets
 */

export interface VehiclePosition {
  id_vehicle: number
  id_route?: number
  latitude: number
  longitude: number
  speed?: number // en km/h
  heading?: number // dirección en grados (0-360)
  timestamp: string
  status: 'en_ruta' | 'detenido' | 'entregando' | 'completado'
}

export interface RouteTracking {
  id_route: number
  vehicle_positions: VehiclePosition[]
  current_stop_index: number // Índice de la parada actual
  estimated_arrival?: string
  progress_percentage: number // 0-100
}

export class GPSTrackingService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000

  /**
   * Conectar a WebSocket para recibir actualizaciones GPS
   */
  connect(
    onPositionUpdate: (position: VehiclePosition) => void,
    onError?: (error: Event) => void
  ) {
    if (typeof window === 'undefined') return

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000'
    
    try {
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log('✅ WebSocket conectado para seguimiento GPS')
        this.reconnectAttempts = 0
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'vehicle_position' && data.position) {
            onPositionUpdate(data.position as VehiclePosition)
          }
        } catch (error) {
          console.error('Error al parsear mensaje WebSocket:', error)
        }
      }

      this.ws.onerror = (error) => {
        console.error('Error en WebSocket:', error)
        if (onError) {
          onError(error)
        }
      }

      this.ws.onclose = () => {
        console.log('WebSocket desconectado')
        this.attemptReconnect(onPositionUpdate, onError)
      }
    } catch (error) {
      console.error('Error al conectar WebSocket:', error)
    }
  }

  /**
   * Intentar reconectar WebSocket
   */
  private attemptReconnect(
    onPositionUpdate: (position: VehiclePosition) => void,
    onError?: (error: Event) => void
  ) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Máximo de intentos de reconexión alcanzado')
      return
    }

    this.reconnectAttempts++
    console.log(`Intentando reconectar... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

    setTimeout(() => {
      this.connect(onPositionUpdate, onError)
    }, this.reconnectDelay)
  }

  /**
   * Desconectar WebSocket
   */
  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  /**
   * Enviar posición GPS (desde la app móvil)
   */
  sendPosition(position: VehiclePosition) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'gps_update',
          position
        })
      )
    }
  }

  /**
   * Suscribirse a actualizaciones de un vehículo específico
   */
  subscribeToVehicle(vehicleId: number) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'subscribe',
          vehicle_id: vehicleId
        })
      )
    }
  }

  /**
   * Obtener posición actual de un vehículo (fallback si no hay WebSocket)
   */
  async getCurrentPosition(vehicleId: number): Promise<VehiclePosition | null> {
    try {
      // TODO: Implementar endpoint en backend para obtener posición actual
      // Por ahora retornamos null
      return null
    } catch (error) {
      console.error('Error al obtener posición actual:', error)
      return null
    }
  }

  /**
   * Calcular progreso de una ruta
   */
  calculateRouteProgress(
    currentPosition: VehiclePosition,
    routeCoordinates: [number, number][]
  ): number {
    if (routeCoordinates.length === 0) return 0

    // Encontrar el punto más cercano en la ruta
    let minDistance = Infinity
    let closestIndex = 0

    for (let i = 0; i < routeCoordinates.length; i++) {
      const [lat, lng] = routeCoordinates[i]
      const distance = this.calculateDistance(
        currentPosition.latitude,
        currentPosition.longitude,
        lat,
        lng
      )

      if (distance < minDistance) {
        minDistance = distance
        closestIndex = i
      }
    }

    // Calcular porcentaje de progreso
    return Math.round((closestIndex / routeCoordinates.length) * 100)
  }

  /**
   * Calcular distancia entre dos puntos (fórmula de Haversine)
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371 // Radio de la Tierra en km
    const dLat = this.toRad(lat2 - lat1)
    const dLon = this.toRad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180
  }
}

