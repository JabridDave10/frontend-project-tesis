import { OptimizedRoute } from './cargoTypes'
import { Vehicle } from './vehicleTypes'
import { Driver } from './driverTypes'

// ==================== DELIVERY ITEMS & POINTS ====================

export interface DeliveryItem {
  id_product: number
  product_name: string
  sku: string
  quantity: number
  weight_per_unit: number
  volume_per_unit: number
  total_weight: number
  total_volume: number
  requires_refrigeration: boolean
  is_fragile: boolean
  is_hazardous: boolean
  stock_available: number
}

export interface DeliveryPoint {
  id: string // UUID
  address: string
  latitude: number
  longitude: number
  recipient_name?: string
  recipient_phone?: string
  items: DeliveryItem[]
  total_weight: number
  total_volume: number
  priority: 'baja' | 'media' | 'alta' | 'urgente'
  notes?: string
}

// ==================== DISTANCE MATRIX ====================

export interface DistanceMatrixResult {
  distances: number[][] // km
  durations: number[][] // minutos
}

// ==================== ALGORITHM CONFIG ====================

export type VRPAlgorithm = 'clarke-wright' | 'sweep' | 'nearest-neighbor'

export interface VRPConfig {
  algorithm: VRPAlgorithm
  apply2Opt: boolean
  respectVolumeCapacity: boolean
  maxStopsPerRoute: number
}

// ==================== VEHICLE-DRIVER PAIRS ====================

export interface VehicleDriverPair {
  vehicle: {
    id_vehicle: number
    license_plate: string
    vehicle_type: string
    weight_capacity: number
    volume_capacity: number
    brand: string
    model: string
  }
  driver: {
    id_driver: number
    first_name: string
    last_name: string
    phone?: string
    license_categories: string[]
  }
}

// ==================== VRP ROUTE RESULTS ====================

export interface VRPRouteStop {
  delivery_point: DeliveryPoint
  sequence: number
  arrival_distance: number // km acumulados
  arrival_duration: number // minutos acumulados
}

export interface VRPRoute {
  route_code: string
  vehicle: VehicleDriverPair['vehicle'] | null
  driver: VehicleDriverPair['driver'] | null
  stops: VRPRouteStop[]
  route_coordinates: [number, number][] // [lat, lng]
  total_distance: number // km
  total_duration: number // minutos
  total_weight: number
  total_volume: number
  weight_utilization: number // 0-100%
  volume_utilization: number // 0-100%
}

export interface VRPResult {
  routes: VRPRoute[]
  unassigned_points: DeliveryPoint[]
  algorithm_used: VRPAlgorithm
  applied_2opt: boolean
  total_distance: number
  total_duration: number
  computation_time_ms: number
  warnings: string[]
}

// ==================== ADAPTER ====================

/**
 * Convierte VRPRoute[] a OptimizedRoute[] para reutilizar OptimizedRouteMap
 */
export function convertVRPRoutesToOptimizedRoutes(
  routes: VRPRoute[],
  origin: { address: string; lat: number; lng: number }
): OptimizedRoute[] {
  return routes.map(route => ({
    route_code: route.route_code,
    id_vehicle: route.vehicle?.id_vehicle ?? 0,
    id_driver: route.driver?.id_driver ?? 0,
    origin_address: origin.address,
    origin_latitude: origin.lat,
    origin_longitude: origin.lng,
    assignments: route.stops.map((stop, idx) => ({
      cargo: {
        id_cargo: idx + 1,
        id_company: 0,
        description: stop.delivery_point.items.map(i => `${i.product_name} x${i.quantity}`).join(', '),
        weight: stop.delivery_point.total_weight,
        volume: stop.delivery_point.total_volume,
        destination_address: stop.delivery_point.address,
        destination_latitude: stop.delivery_point.latitude,
        destination_longitude: stop.delivery_point.longitude,
        recipient_name: stop.delivery_point.recipient_name,
        recipient_phone: stop.delivery_point.recipient_phone,
        priority: stop.delivery_point.priority,
        status: 'pendiente' as const,
        created_at: new Date().toISOString(),
        modified_at: new Date().toISOString(),
      },
      vehicle: {
        id_vehicle: route.vehicle?.id_vehicle ?? 0,
        license_plate: route.vehicle?.license_plate ?? 'N/A',
        vehicle_type: route.vehicle?.vehicle_type ?? '',
        weight_capacity: route.vehicle?.weight_capacity ?? 0,
        volume_capacity: route.vehicle?.volume_capacity ?? 0,
      },
      driver: {
        id_driver: route.driver?.id_driver ?? 0,
        first_name: route.driver?.first_name ?? 'Sin',
        last_name: route.driver?.last_name ?? 'Conductor',
        phone: route.driver?.phone,
      },
      route_order: stop.sequence,
    })),
    route_coordinates: route.route_coordinates,
    total_distance: route.total_distance,
    total_duration: route.total_duration,
    total_weight: route.total_weight,
    total_volume: route.total_volume,
    status: 'pendiente' as const,
  }))
}
