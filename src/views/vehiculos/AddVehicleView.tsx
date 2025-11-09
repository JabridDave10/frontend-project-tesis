'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { VehiclesService } from '@/services/vehiclesService'
import { DriversService } from '@/services/driversService'
import { CreateVehicleDto } from '@/types/vehicleTypes'
import { Driver } from '@/types/driverTypes'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export const AddVehicleView = () => {
  const router = useRouter()
  const vehiclesService = new VehiclesService()
  const driversService = new DriversService()

  const [isLoading, setIsLoading] = useState(false)
  const [drivers, setDrivers] = useState<Driver[]>([])

  const [vehicleData, setVehicleData] = useState<CreateVehicleDto>({
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
    loadDrivers()
  }, [])

  const loadDrivers = async () => {
    const data = await driversService.getAvailableDrivers()
    setDrivers(data)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setVehicleData(prev => ({
      ...prev,
      [name]: ['year', 'weight_capacity', 'volume_capacity', 'current_mileage', 'id_driver'].includes(name)
        ? parseFloat(value) || 0
        : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await vehiclesService.createVehicle(vehicleData)
      if (result) {
        router.push('/dashboard/camiones')
      }
    } catch (error) {
      console.error('Error al crear vehículo:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Agregar Vehículo</h1>
          <p className="text-gray-600">Complete la información del vehículo</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Básica */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Información Básica</h2>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="text"
                  name="license_plate"
                  value={vehicleData.license_plate}
                  onChange={handleInputChange}
                  placeholder="Matrícula/Placa *"
                  required
                />

                <div>
                  <select
                    name="vehicle_type"
                    value={vehicleData.vehicle_type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-800"
                    required
                  >
                    <option value="moto">Moto</option>
                    <option value="carro">Carro</option>
                    <option value="furgoneta">Furgoneta</option>
                    <option value="camion">Camión</option>
                    <option value="camion_articulado">Camión Articulado</option>
                  </select>
                </div>

                <Input
                  type="text"
                  name="brand"
                  value={vehicleData.brand}
                  onChange={handleInputChange}
                  placeholder="Marca *"
                  required
                />

                <Input
                  type="text"
                  name="model"
                  value={vehicleData.model}
                  onChange={handleInputChange}
                  placeholder="Modelo *"
                  required
                />

                <Input
                  type="number"
                  name="year"
                  value={vehicleData.year.toString()}
                  onChange={handleInputChange}
                  placeholder="Año *"
                  required
                />

                <div>
                  <select
                    name="status"
                    value={vehicleData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-800"
                  >
                    <option value="activo">Activo</option>
                    <option value="en_mantenimiento">En Mantenimiento</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Capacidad */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Capacidad</h2>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  name="weight_capacity"
                  value={vehicleData.weight_capacity.toString()}
                  onChange={handleInputChange}
                  placeholder="Capacidad de Peso (kg) *"
                  required
                />

                <Input
                  type="number"
                  name="volume_capacity"
                  value={vehicleData.volume_capacity?.toString() || ''}
                  onChange={handleInputChange}
                  placeholder="Capacidad Volumétrica (m³)"
                />
              </div>
            </div>

            {/* Documentación */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Documentación</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vencimiento de Seguro/SOAT
                  </label>
                  <Input
                    type="date"
                    name="insurance_expiry"
                    value={vehicleData.insurance_expiry || ''}
                    onChange={handleInputChange}
                    placeholder="Vencimiento de Seguro"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vencimiento de Revisión Técnica
                  </label>
                  <Input
                    type="date"
                    name="technical_review_expiry"
                    value={vehicleData.technical_review_expiry || ''}
                    onChange={handleInputChange}
                    placeholder="Vencimiento de Revisión Técnica"
                  />
                </div>

                <Input
                  type="number"
                  name="current_mileage"
                  value={vehicleData.current_mileage?.toString() || '0'}
                  onChange={handleInputChange}
                  placeholder="Kilometraje Actual"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conductor Asignado
                  </label>
                  <select
                    name="id_driver"
                    value={vehicleData.id_driver || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-800"
                  >
                    <option value="">Sin asignar</option>
                    {drivers.map((driver) => (
                      <option key={driver.id_driver} value={driver.id_driver}>
                        {driver.first_name} {driver.last_name} - {driver.license_number}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Información Adicional */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Información Adicional</h2>
              <div className="space-y-4">
                <Input
                  type="url"
                  name="photo"
                  value={vehicleData.photo || ''}
                  onChange={handleInputChange}
                  placeholder="URL de la Foto del Vehículo (Opcional)"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas u Observaciones
                  </label>
                  <textarea
                    name="notes"
                    value={vehicleData.notes || ''}
                    onChange={handleInputChange}
                    placeholder="Observaciones adicionales..."
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-800 placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/dashboard/camiones')}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Creando Vehículo...' : 'Crear Vehículo'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
