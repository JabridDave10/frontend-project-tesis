// Tipos para Cargas
export interface Cargo {
  id_cargo: number
  id_company: number
  description: string
  weight: number
  volume?: number
  material_type?: string
  destination_address: string
  destination_latitude?: number
  destination_longitude?: number
  recipient_name?: string
  recipient_phone?: string
  recipient_company?: string
  priority?: 'baja' | 'media' | 'alta' | 'urgente'
  status: 'pendiente' | 'asignada' | 'en_transito' | 'entregada' | 'cancelada'
  scheduled_date?: string
  delivery_notes?: string
  created_at: string
  modified_at: string
  deleted_at?: string
}

export interface CreateCargoDto {
  id_company: number
  description: string
  weight: number
  volume?: number
  material_type?: string
  destination_address: string
  destination_latitude?: number
  destination_longitude?: number
  recipient_name?: string
  recipient_phone?: string
  recipient_company?: string
  priority?: 'baja' | 'media' | 'alta' | 'urgente'
  scheduled_date?: string
  delivery_notes?: string
}

export interface CargoAssignment {
  cargo: Cargo
  vehicle: {
    id_vehicle: number
    license_plate: string
    vehicle_type: string
    weight_capacity: number
    volume_capacity?: number
  }
  driver: {
    id_driver: number
    first_name: string
    last_name: string
    phone?: string
  }
  route_order: number // Orden en la ruta (1, 2, 3...)
}

export interface OptimizedRoute {
  id_route?: number
  route_code: string
  id_vehicle: number
  id_driver: number
  origin_address: string
  origin_latitude: number
  origin_longitude: number
  assignments: CargoAssignment[]
  route_coordinates: [number, number][] // Coordenadas de la ruta completa
  total_distance: number // en km
  total_duration: number // en minutos
  total_weight: number
  total_volume?: number
  estimated_cost?: number
  status: 'pendiente' | 'en_progreso' | 'completada' | 'cancelada'
}

