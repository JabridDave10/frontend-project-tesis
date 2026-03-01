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

// ==================== NORMATIVA COLOMBIANA ====================

/**
 * Mapeo normativo colombiano: Ley 769/2002, Resolucion 1500/2005
 * Tipo de vehiculo → Licencias validas
 */
export const LICENSE_VEHICLE_MAP: Record<string, string[]> = {
  moto: ['A1', 'A2'],
  carro: ['B1', 'B2', 'B3', 'C1', 'C2', 'C3'],
  furgoneta: ['B1', 'B2', 'B3', 'C1', 'C2', 'C3'],
  camion: ['B2', 'B3', 'C2', 'C3'],
  camion_articulado: ['B3', 'C3'],
}

/**
 * Jerarquia de licencias: licencia superior cubre inferior
 */
const LICENSE_HIERARCHY: Record<string, string[]> = {
  A2: ['A1'],
  B2: ['B1'],
  B3: ['B1', 'B2'],
  C1: ['B1'],
  C2: ['B1', 'C1'],
  C3: ['B1', 'B3', 'C1', 'C2'],
}

function expandLicenses(licenseCategories: string[]): string[] {
  const expanded = new Set<string>()
  for (const license of licenseCategories) {
    const upper = license.toUpperCase()
    expanded.add(upper)
    const covers = LICENSE_HIERARCHY[upper]
    if (covers) {
      for (const covered of covers) {
        expanded.add(covered)
      }
    }
  }
  return Array.from(expanded)
}

export function isDriverCompatible(licenseCategories: string[], vehicleType: string): boolean {
  const requiredLicenses = LICENSE_VEHICLE_MAP[vehicleType]
  if (!requiredLicenses || !licenseCategories?.length) return false
  const expanded = expandLicenses(licenseCategories)
  return requiredLicenses.some(req => expanded.includes(req))
}

export function getCompatibleVehicleTypes(licenseCategories: string[]): string[] {
  if (!licenseCategories?.length) return []
  const expanded = expandLicenses(licenseCategories)
  return Object.entries(LICENSE_VEHICLE_MAP)
    .filter(([, required]) => required.some(req => expanded.includes(req)))
    .map(([type]) => type)
}

export function getRequiredLicenses(vehicleType: string): string[] {
  return LICENSE_VEHICLE_MAP[vehicleType] || []
}

export const VEHICLE_TYPE_LABELS: Record<string, string> = {
  moto: 'Moto',
  carro: 'Carro',
  furgoneta: 'Furgoneta',
  camion: 'Camion',
  camion_articulado: 'Camion Articulado',
}

export const VEHICLE_TYPE_ICONS: Record<string, string> = {
  moto: '🏍️',
  carro: '🚗',
  furgoneta: '🚐',
  camion: '🚛',
  camion_articulado: '🚚',
}

// ==================== FORMATO DE PLACAS COLOMBIANAS ====================

/**
 * Formatos de placa vehicular en Colombia
 * Resolucion 4775/2009 del Ministerio de Transporte
 *
 * - Motocicletas: ABC 12D  (3 letras + 2 numeros + 1 letra) - fondo amarillo, 235x105mm
 * - Vehiculos particulares (carro, furgoneta, camion): ABC 123 (3 letras + 3 numeros) - fondo amarillo, 330x160mm
 * - Vehiculos servicio publico: ABC 123 - fondo blanco
 * - Remolques: R 12345 (1 letra + 5 numeros) - fondo verde
 * - Semirremolques: S 12345 - fondo verde
 * - Diplomaticos: CD 1234 (2 letras + 4 numeros) - fondo azul
 */
export interface PlateFormatInfo {
  pattern: RegExp
  placeholder: string
  description: string
  example: string
  maxLength: number
}

export const PLATE_FORMATS: Record<string, PlateFormatInfo> = {
  moto: {
    pattern: /^[A-Z]{3}\s?\d{2}[A-Z]$/,
    placeholder: 'ABC 12D',
    description: 'Formato: 3 letras + 2 numeros + 1 letra (placa 235x105mm)',
    example: 'FSH 57G',
    maxLength: 7,
  },
  carro: {
    pattern: /^[A-Z]{3}\s?\d{3}$/,
    placeholder: 'ABC 123',
    description: 'Formato: 3 letras + 3 numeros (placa 330x160mm)',
    example: 'BHP 789',
    maxLength: 7,
  },
  furgoneta: {
    pattern: /^[A-Z]{3}\s?\d{3}$/,
    placeholder: 'ABC 123',
    description: 'Formato: 3 letras + 3 numeros',
    example: 'JKL 012',
    maxLength: 7,
  },
  camion: {
    pattern: /^[A-Z]{3}\s?\d{3}$/,
    placeholder: 'ABC 123',
    description: 'Formato: 3 letras + 3 numeros',
    example: 'MNO 345',
    maxLength: 7,
  },
  camion_articulado: {
    pattern: /^[A-Z]{3}\s?\d{3}$/,
    placeholder: 'ABC 123',
    description: 'Formato: 3 letras + 3 numeros (tractocamion)',
    example: 'RST 678',
    maxLength: 7,
  },
}

/**
 * Valida el formato de una placa vehicular colombiana
 */
export function validatePlateFormat(plate: string, vehicleType: string): { valid: boolean; message?: string } {
  const format = PLATE_FORMATS[vehicleType]
  if (!format) return { valid: true }

  const normalized = plate.toUpperCase().trim()
  if (!normalized) return { valid: false, message: 'La placa es obligatoria' }

  if (!format.pattern.test(normalized)) {
    return {
      valid: false,
      message: `Formato invalido. ${format.description}. Ejemplo: ${format.example}`,
    }
  }

  return { valid: true }
}
