// Route types
export interface Route {
  id_route: number
  route_code: string
  id_driver?: number
  id_vehicle?: number
  origin_address: string
  origin_latitude?: number
  origin_longitude?: number
  destination_address: string
  destination_latitude?: number
  destination_longitude?: number
  cargo_weight: number
  cargo_volume?: number
  cargo_description?: string
  status: 'pendiente' | 'en_progreso' | 'completada' | 'cancelada'
  estimated_distance?: number
  estimated_duration?: number
  estimated_cost?: number
  scheduled_date?: string
  started_at?: string
  completed_at?: string
  notes?: string
  created_at: string
  modified_at: string
  deleted_at?: string
  // Datos relacionados
  driver_license?: string
  driver_first_name?: string
  driver_last_name?: string
  driver_phone?: string
  vehicle_plate?: string
  vehicle_type?: string
  vehicle_brand?: string
  vehicle_model?: string
}

export interface CreateRouteDto {
  route_code: string
  id_driver?: number
  id_vehicle?: number
  origin_address: string
  origin_latitude?: number
  origin_longitude?: number
  destination_address: string
  destination_latitude?: number
  destination_longitude?: number
  cargo_weight: number
  cargo_volume?: number
  cargo_description?: string
  status?: string
  estimated_distance?: number
  estimated_duration?: number
  estimated_cost?: number
  scheduled_date?: string
  notes?: string
}

export interface UpdateRouteDto extends Partial<CreateRouteDto> {}

export interface RouteResponse {
  message: string
  data: Route
}

export interface RoutesListResponse {
  data: Route[]
}
