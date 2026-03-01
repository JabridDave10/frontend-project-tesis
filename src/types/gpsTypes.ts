export interface ActiveDriverPosition {
  id_driver: number
  id_vehicle?: number
  id_route?: number
  latitude: number
  longitude: number
  speed: number
  heading: number
  accuracy: number
  status: string
  recorded_at: string
  first_name: string
  last_name: string
  photo?: string
  license_number?: string
  license_plate?: string
  vehicle_type?: string
  brand?: string
  model?: string
  route_code?: string
  origin_address?: string
  destination_address?: string
  route_status?: string
}

export interface DashboardStats {
  active_routes: number
  active_vehicles: number
  total_drivers: number
  tracking_drivers: number
}
