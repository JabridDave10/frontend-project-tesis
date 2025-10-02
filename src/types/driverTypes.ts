// Driver types
export interface Driver {
  id_driver: number
  id_user: number
  license_number: string
  license_type: string
  license_expiry_date: string
  license_photo?: string
  years_experience: number
  status: 'disponible' | 'en_ruta' | 'descanso' | 'inactivo'
  notes?: string
  created_at: string
  modified_at: string
  deleted_at?: string
  // Datos del usuario relacionado
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
}

export interface CreateDriverDto {
  id_user: number
  license_number: string
  license_type: string
  license_expiry_date: string
  license_photo?: string
  years_experience?: number
  status?: string
  notes?: string
}

export interface UpdateDriverDto extends Partial<CreateDriverDto> {}

export interface DriverResponse {
  message: string
  data: Driver
}

export interface DriversListResponse {
  data: Driver[]
}
