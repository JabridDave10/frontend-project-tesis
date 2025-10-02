// Vehicle types
export interface Vehicle {
  id_vehicle: number
  license_plate: string
  vehicle_type: 'moto' | 'carro' | 'furgoneta' | 'camion' | 'camion_articulado'
  brand: string
  model: string
  year: number
  weight_capacity: number
  volume_capacity?: number
  status: 'activo' | 'en_mantenimiento' | 'inactivo'
  insurance_expiry?: string
  technical_review_expiry?: string
  current_mileage: number
  id_driver?: number
  photo?: string
  notes?: string
  created_at: string
  modified_at: string
  deleted_at?: string
  // Datos del conductor relacionado
  driver_license?: string
  driver_first_name?: string
  driver_last_name?: string
  driver_phone?: string
}

export interface CreateVehicleDto {
  license_plate: string
  vehicle_type: string
  brand: string
  model: string
  year: number
  weight_capacity: number
  volume_capacity?: number
  status?: string
  insurance_expiry?: string
  technical_review_expiry?: string
  current_mileage?: number
  id_driver?: number
  photo?: string
  notes?: string
}

export interface UpdateVehicleDto extends Partial<CreateVehicleDto> {}

export interface VehicleResponse {
  message: string
  data: Vehicle
}

export interface VehiclesListResponse {
  data: Vehicle[]
}
