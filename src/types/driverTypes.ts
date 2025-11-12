// ==================== ENUMS ====================

export enum LicenseCategory {
  A1 = 'A1', // Motos hasta 125cc
  A2 = 'A2', // Motos más de 125cc
  B1 = 'B1', // Vehículos particulares
  B2 = 'B2', // Camiones y buses particulares
  B3 = 'B3', // Articulados particulares
  C1 = 'C1', // Vehículos públicos
  C2 = 'C2', // Camiones y buses públicos
  C3 = 'C3', // Articulados públicos
}

export enum BloodType {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-',
}

// ==================== INTERFACES ====================

export interface Driver {
  id_driver: number
  id_user: number

  // Información de Licencia
  license_number: string
  license_categories: LicenseCategory[]
  license_issue_date: string
  license_expiry_date: string
  license_issuing_authority: string
  license_photo?: string

  // Información Médica
  blood_type: BloodType
  medical_certificate_date: string
  medical_certificate_expiry: string
  medical_restrictions?: string

  // Contacto de Emergencia
  emergency_contact_name: string
  emergency_contact_relationship: string
  emergency_contact_phone: string

  // Otros Datos
  address?: string
  status: 'disponible' | 'en_ruta' | 'descanso' | 'inactivo'
  notes?: string

  // Timestamps
  created_at: string
  modified_at: string
  deleted_at?: string

  // Datos del usuario relacionado (join)
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
}

export interface CreateDriverDto {
  id_user: number

  // Información de Licencia
  license_number: string
  license_categories: LicenseCategory[]
  license_issue_date: string
  license_expiry_date: string
  license_issuing_authority: string
  license_photo?: string

  // Información Médica
  blood_type: BloodType
  medical_certificate_date: string
  medical_certificate_expiry: string
  medical_restrictions?: string

  // Contacto de Emergencia
  emergency_contact_name: string
  emergency_contact_relationship: string
  emergency_contact_phone: string

  // Otros Datos
  address?: string
  notes?: string
  // NOTA: status se auto-asigna como 'disponible' en el backend
}

export interface UpdateDriverDto extends Partial<CreateDriverDto> {}

export interface DriverResponse {
  message: string
  data: Driver
}

export interface DriversListResponse {
  data: Driver[]
}

// ==================== DATOS DE UTILIDAD ====================

export const LICENSE_CATEGORY_LABELS: Record<LicenseCategory, string> = {
  [LicenseCategory.A1]: 'A1 - Motocicletas hasta 125cc',
  [LicenseCategory.A2]: 'A2 - Motocicletas más de 125cc',
  [LicenseCategory.B1]: 'B1 - Automóviles, camionetas (particular)',
  [LicenseCategory.B2]: 'B2 - Camiones, buses (particular)',
  [LicenseCategory.B3]: 'B3 - Vehículos articulados (particular)',
  [LicenseCategory.C1]: 'C1 - Automóviles, camionetas (público)',
  [LicenseCategory.C2]: 'C2 - Camiones, buses (público)',
  [LicenseCategory.C3]: 'C3 - Vehículos articulados (público)',
}

export const BLOOD_TYPE_OPTIONS = [
  { value: BloodType.A_POSITIVE, label: 'A+' },
  { value: BloodType.A_NEGATIVE, label: 'A-' },
  { value: BloodType.B_POSITIVE, label: 'B+' },
  { value: BloodType.B_NEGATIVE, label: 'B-' },
  { value: BloodType.AB_POSITIVE, label: 'AB+' },
  { value: BloodType.AB_NEGATIVE, label: 'AB-' },
  { value: BloodType.O_POSITIVE, label: 'O+' },
  { value: BloodType.O_NEGATIVE, label: 'O-' },
]

export const ISSUING_AUTHORITIES = [
  'Secretaría de Movilidad de Bogotá',
  'Secretaría de Tránsito de Medellín',
  'Secretaría de Tránsito de Cali',
  'Secretaría de Tránsito de Barranquilla',
  'Secretaría de Tránsito de Cartagena',
  'Secretaría de Tránsito de Bucaramanga',
  'Secretaría de Movilidad de Cúcuta',
  'Otro',
]
