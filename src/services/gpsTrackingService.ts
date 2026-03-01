import { io, Socket } from 'socket.io-client'

export interface VehiclePosition {
  id_driver: number
  id_vehicle?: number
  id_route?: number
  latitude: number
  longitude: number
  speed: number
  heading: number
  accuracy: number
  status: string
  timestamp: string
  first_name?: string
  last_name?: string
  license_plate?: string
  vehicle_type?: string
  route_code?: string
}

export class GPSTrackingService {
  private socket: Socket | null = null
  private connected = false

  connect(token: string): Socket {
    if (this.socket?.connected) return this.socket

    const wsUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

    this.socket = io(`${wsUrl}/gps`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    })

    this.socket.on('connect', () => {
      console.log('GPS WebSocket connected')
      this.connected = true
    })

    this.socket.on('disconnect', () => {
      console.log('GPS WebSocket disconnected')
      this.connected = false
    })

    this.socket.on('connect_error', (err) => {
      console.error('GPS WebSocket connection error:', err.message)
      this.connected = false
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.connected = false
    }
  }

  subscribeToDashboard() {
    this.socket?.emit('subscribe_dashboard')
  }

  registerDriver(driverId: number) {
    this.socket?.emit('register_driver', { id_driver: driverId })
  }

  sendPosition(data: {
    id_driver: number
    latitude: number
    longitude: number
    speed?: number
    heading?: number
    accuracy?: number
    status?: string
    id_vehicle?: number
    id_route?: number
  }) {
    this.socket?.emit('gps_update', data)
  }

  stopTracking(driverId: number) {
    this.socket?.emit('stop_tracking', { id_driver: driverId })
  }

  onVehiclePosition(callback: (position: VehiclePosition) => void) {
    this.socket?.on('vehicle_position', (data: any) => {
      callback({
        ...data,
        timestamp: data.recorded_at || new Date().toISOString(),
      })
    })
  }

  onDriverOffline(callback: (data: { id_driver: number }) => void) {
    this.socket?.on('driver_offline', callback)
  }

  onActiveDrivers(callback: (drivers: VehiclePosition[]) => void) {
    this.socket?.on('active_drivers', (data: any[]) => {
      callback(
        data.map((d) => ({
          ...d,
          timestamp: d.recorded_at || new Date().toISOString(),
        })),
      )
    })
  }

  onRegistered(callback: (data: { success: boolean; id_driver: number }) => void) {
    this.socket?.on('registered', callback)
  }

  onTrackingStopped(callback: (data: { success: boolean }) => void) {
    this.socket?.on('tracking_stopped', callback)
  }

  isConnected(): boolean {
    return this.connected
  }

  getSocket(): Socket | null {
    return this.socket
  }
}
