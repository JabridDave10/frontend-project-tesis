'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { VehiclesService } from '@/services/vehiclesService'
import { DriversService } from '@/services/driversService'
import { UpdateVehicleDto, Vehicle, isDriverCompatible, getRequiredLicenses, VEHICLE_TYPE_LABELS, PLATE_FORMATS, validatePlateFormat } from '@/types/vehicleTypes'
import { Driver } from '@/types/driverTypes'
import { Truck, FileText, Gauge, User, Info, AlertTriangle, Shield, ArrowLeft } from 'lucide-react'

interface EditVehicleViewProps {
  vehicleId: number
}

export const EditVehicleView = ({ vehicleId }: EditVehicleViewProps) => {
  const router = useRouter()
  const vehiclesService = new VehiclesService()
  const driversService = new DriversService()

  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [drivers, setDrivers] = useState<Driver[]>([])

  const [vehicleData, setVehicleData] = useState<UpdateVehicleDto>({
    license_plate: '',
    vehicle_type: 'camion',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    weight_capacity: 0,
    volume_capacity: 0,
    status: 'activo',
    insurance_expiry: '',
    technical_review_expiry: '',
    current_mileage: 0,
    id_driver: undefined,
    photo: '',
    notes: ''
  })

  useEffect(() => {
    loadData()
  }, [vehicleId])

  const loadData = async () => {
    setIsFetching(true)
    const [vehicle, driversData] = await Promise.all([
      vehiclesService.getVehicleById(vehicleId),
      driversService.getAllDrivers()
    ])

    if (vehicle) {
      setVehicleData({
        license_plate: vehicle.license_plate,
        vehicle_type: vehicle.vehicle_type,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        weight_capacity: vehicle.weight_capacity,
        volume_capacity: vehicle.volume_capacity || 0,
        status: vehicle.status,
        insurance_expiry: vehicle.insurance_expiry ? vehicle.insurance_expiry.split('T')[0] : '',
        technical_review_expiry: vehicle.technical_review_expiry ? vehicle.technical_review_expiry.split('T')[0] : '',
        current_mileage: vehicle.current_mileage || 0,
        id_driver: vehicle.id_driver || undefined,
        photo: vehicle.photo || '',
        notes: vehicle.notes || ''
      })
    }

    setDrivers(driversData)
    setIsFetching(false)
  }

  const requiredLicenses = useMemo(() => getRequiredLicenses(vehicleData.vehicle_type || 'camion'), [vehicleData.vehicle_type])

  const plateFormat = useMemo(() => PLATE_FORMATS[vehicleData.vehicle_type || 'camion'] || PLATE_FORMATS.carro, [vehicleData.vehicle_type])

  const plateValidation = useMemo(() => {
    if (!vehicleData.license_plate) return null
    return validatePlateFormat(vehicleData.license_plate, vehicleData.vehicle_type || 'camion')
  }, [vehicleData.license_plate, vehicleData.vehicle_type])

  const compatibleDrivers = useMemo(() => {
    return drivers.filter(driver => {
      const categories = Array.isArray(driver.license_categories)
        ? driver.license_categories
        : typeof driver.license_categories === 'string'
          ? (driver.license_categories as string).split(',').map(c => c.trim())
          : []
      return isDriverCompatible(categories, vehicleData.vehicle_type || 'camion')
    })
  }, [drivers, vehicleData.vehicle_type])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setVehicleData(prev => ({
      ...prev,
      [name]: ['year', 'weight_capacity', 'volume_capacity', 'current_mileage'].includes(name)
        ? parseFloat(value) || 0
        : name === 'id_driver'
          ? value ? parseInt(value) : undefined
          : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload = { ...vehicleData }
      if (!payload.id_driver) payload.id_driver = undefined

      const result = await vehiclesService.updateVehicle(vehicleId, payload)
      if (result) {
        router.push('/dashboard/vehiculos')
      }
    } catch (error) {
      console.error('Error al actualizar vehiculo:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const vehicleTypeOptions = [
    { value: 'moto', label: 'Moto', icon: '🏍️' },
    { value: 'carro', label: 'Carro', icon: '🚗' },
    { value: 'furgoneta', label: 'Furgoneta', icon: '🚐' },
    { value: 'camion', label: 'Camion', icon: '🚛' },
    { value: 'camion_articulado', label: 'Camion Articulado', icon: '🚚' },
  ]

  if (isFetching) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Cargando vehiculo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/vehiculos')}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-700 transition-colors mb-4 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a vehiculos
          </button>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Editar Vehiculo</h1>
          <p className="text-slate-500">Modifique la informacion del vehiculo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informacion Basica */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800">Informacion Basica</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Matricula/Placa *</label>
                <input
                  type="text"
                  name="license_plate"
                  value={vehicleData.license_plate || ''}
                  onChange={(e) => {
                    const upper = e.target.value.toUpperCase()
                    setVehicleData(prev => ({ ...prev, license_plate: upper }))
                  }}
                  placeholder={plateFormat.placeholder}
                  maxLength={plateFormat.maxLength}
                  required
                  className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-800 uppercase ${
                    plateValidation && !plateValidation.valid ? 'border-red-300' : 'border-slate-200'
                  }`}
                />
                <p className="mt-1 text-xs text-slate-400">{plateFormat.description}</p>
                {plateValidation && !plateValidation.valid && (
                  <p className="mt-1 text-xs text-red-500">{plateValidation.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Tipo de Vehiculo *</label>
                <select
                  name="vehicle_type"
                  value={vehicleData.vehicle_type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-800"
                  required
                >
                  {vehicleTypeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Marca *</label>
                <input
                  type="text"
                  name="brand"
                  value={vehicleData.brand || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Modelo *</label>
                <input
                  type="text"
                  name="model"
                  value={vehicleData.model || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Ano *</label>
                <input
                  type="number"
                  name="year"
                  value={vehicleData.year?.toString() || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Estado</label>
                <select
                  name="status"
                  value={vehicleData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-800"
                >
                  <option value="activo">Activo</option>
                  <option value="en_mantenimiento">En Mantenimiento</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            </div>

            {/* Required licenses panel */}
            <div className="mt-4 p-3 bg-blue-50/70 border border-blue-100 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Licencias requeridas para {VEHICLE_TYPE_LABELS[vehicleData.vehicle_type || ''] || vehicleData.vehicle_type}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {requiredLicenses.map(lic => (
                  <span key={lic} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-md">{lic}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Capacidad */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-cyan-50 rounded-lg">
                <Gauge className="w-5 h-5 text-cyan-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800">Capacidad</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Capacidad de Peso (kg) *</label>
                <input
                  type="number"
                  name="weight_capacity"
                  value={vehicleData.weight_capacity?.toString() || '0'}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Capacidad Volumetrica (m3)</label>
                <input
                  type="number"
                  name="volume_capacity"
                  value={vehicleData.volume_capacity?.toString() || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Documentacion */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-amber-50 rounded-lg">
                <FileText className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800">Documentacion</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Vencimiento de Seguro/SOAT</label>
                <input
                  type="date"
                  name="insurance_expiry"
                  value={vehicleData.insurance_expiry || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Vencimiento Revision Tecnica</label>
                <input
                  type="date"
                  name="technical_review_expiry"
                  value={vehicleData.technical_review_expiry || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kilometraje Actual</label>
                <input
                  type="number"
                  name="current_mileage"
                  value={vehicleData.current_mileage?.toString() || '0'}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Conductor Asignado */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <User className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800">Conductor Asignado</h2>
            </div>

            {compatibleDrivers.length === 0 && drivers.length > 0 && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-700">
                  No hay conductores disponibles con licencia compatible para un vehiculo tipo <strong>{VEHICLE_TYPE_LABELS[vehicleData.vehicle_type || '']}</strong>. Se requiere licencia: {requiredLicenses.join(', ')}.
                </p>
              </div>
            )}

            <select
              name="id_driver"
              value={vehicleData.id_driver || ''}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-800"
            >
              <option value="">Sin asignar</option>
              {compatibleDrivers.map((driver) => (
                <option key={driver.id_driver} value={driver.id_driver}>
                  {driver.first_name} {driver.last_name} - Lic: {Array.isArray(driver.license_categories) ? driver.license_categories.join(', ') : driver.license_categories}
                </option>
              ))}
            </select>

            {compatibleDrivers.length > 0 && (
              <p className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Solo se muestran conductores con licencia compatible
              </p>
            )}
          </div>

          {/* Informacion Adicional */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Info className="w-5 h-5 text-slate-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800">Informacion Adicional</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">URL de Foto del Vehiculo</label>
                <input
                  type="url"
                  name="photo"
                  value={vehicleData.photo || ''}
                  onChange={handleInputChange}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-800 placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Notas u Observaciones</label>
                <textarea
                  name="notes"
                  value={vehicleData.notes || ''}
                  onChange={handleInputChange}
                  placeholder="Observaciones adicionales..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-800 placeholder:text-slate-400 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-2 pb-8">
            <button
              type="button"
              onClick={() => router.push('/dashboard/vehiculos')}
              className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all disabled:opacity-50 shadow-sm"
            >
              {isLoading ? 'Guardando cambios...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
