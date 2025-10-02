'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DriversService } from '@/services/driversService'
import { AxiosUserManagement } from '@/services/axiosRegister'
import { CreateDriverDto } from '@/types/driverTypes'
import { RegisterUserDto } from '@/types/userTypes'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export const AddDriverView = () => {
  const router = useRouter()
  const driversService = new DriversService()
  const userService = new AxiosUserManagement()

  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'user' | 'driver'>('user')

  // Datos del usuario
  const [userData, setUserData] = useState<RegisterUserDto>({
    first_name: '',
    last_name: '',
    identification: '',
    birthdate: '',
    email: '',
    phone: '',
    password: '',
    photo: '',
    id_role: 2 // Rol de conductor
  })

  // Datos del conductor
  const [driverData, setDriverData] = useState({
    license_number: '',
    license_type: 'B',
    license_expiry_date: '',
    license_photo: '',
    years_experience: 0,
    status: 'disponible',
    notes: ''
  })

  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setUserData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleDriverInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setDriverData(prev => ({
      ...prev,
      [name]: name === 'years_experience' ? parseInt(value) || 0 : value
    }))
  }

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await userService.registerUser(userData)
      if (result) {
        // Pasar al siguiente paso
        setStep('driver')
      }
    } catch (error) {
      console.error('Error al crear usuario:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Obtener el ID del usuario recién creado desde localStorage
      const userStr = localStorage.getItem('user')
      if (!userStr) {
        throw new Error('No se encontró el usuario creado')
      }

      const user = JSON.parse(userStr)

      const driverDto: CreateDriverDto = {
        id_user: user.id,
        license_number: driverData.license_number,
        license_type: driverData.license_type,
        license_expiry_date: driverData.license_expiry_date,
        license_photo: driverData.license_photo || undefined,
        years_experience: driverData.years_experience,
        status: driverData.status,
        notes: driverData.notes || undefined
      }

      const result = await driversService.createDriver(driverDto)
      if (result) {
        router.push('/dashboard/empleados/conductores')
      }
    } catch (error) {
      console.error('Error al crear conductor:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Agregar Conductor</h1>
          <p className="text-gray-600">
            {step === 'user' ? 'Paso 1: Información del Usuario' : 'Paso 2: Información del Conductor'}
          </p>
        </div>

        {/* Indicador de pasos */}
        <div className="mb-8 flex items-center justify-center">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'user' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}`}>
              1
            </div>
            <div className={`w-24 h-1 ${step === 'driver' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'driver' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
              2
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          {step === 'user' ? (
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="text"
                  name="first_name"
                  value={userData.first_name}
                  onChange={handleUserInputChange}
                  placeholder="Nombre"
                  required
                />
                <Input
                  type="text"
                  name="last_name"
                  value={userData.last_name}
                  onChange={handleUserInputChange}
                  placeholder="Apellido"
                  required
                />
              </div>

              <Input
                type="text"
                name="identification"
                value={userData.identification}
                onChange={handleUserInputChange}
                placeholder="Cédula/Identificación"
                required
              />

              <Input
                type="date"
                name="birthdate"
                value={userData.birthdate}
                onChange={handleUserInputChange}
                placeholder="Fecha de Nacimiento"
                required
              />

              <Input
                type="email"
                name="email"
                value={userData.email}
                onChange={handleUserInputChange}
                placeholder="Email"
                required
              />

              <Input
                type="tel"
                name="phone"
                value={userData.phone}
                onChange={handleUserInputChange}
                placeholder="Teléfono"
                required
              />

              <Input
                type="password"
                name="password"
                value={userData.password}
                onChange={handleUserInputChange}
                placeholder="Contraseña"
                required
              />

              <Input
                type="url"
                name="photo"
                value={userData.photo}
                onChange={handleUserInputChange}
                placeholder="URL de la Foto (Opcional)"
              />

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push('/dashboard/empleados/conductores')}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Guardando...' : 'Siguiente'}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleDriverSubmit} className="space-y-4">
              <Input
                type="text"
                name="license_number"
                value={driverData.license_number}
                onChange={handleDriverInputChange}
                placeholder="Número de Licencia"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Licencia
                </label>
                <select
                  name="license_type"
                  value={driverData.license_type}
                  onChange={handleDriverInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                >
                  <option value="A">A - Motocicletas</option>
                  <option value="B">B - Automóviles</option>
                  <option value="C">C - Camiones Livianos</option>
                  <option value="D">D - Camiones Pesados</option>
                  <option value="E">E - Articulados</option>
                </select>
              </div>

              <Input
                type="date"
                name="license_expiry_date"
                value={driverData.license_expiry_date}
                onChange={handleDriverInputChange}
                placeholder="Fecha de Vencimiento de Licencia"
                required
              />

              <Input
                type="number"
                name="years_experience"
                value={driverData.years_experience.toString()}
                onChange={handleDriverInputChange}
                placeholder="Años de Experiencia"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  name="status"
                  value={driverData.status}
                  onChange={handleDriverInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="disponible">Disponible</option>
                  <option value="en_ruta">En Ruta</option>
                  <option value="descanso">Descanso</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>

              <Input
                type="url"
                name="license_photo"
                value={driverData.license_photo}
                onChange={handleDriverInputChange}
                placeholder="URL de la Foto de Licencia (Opcional)"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas (Opcional)
                </label>
                <textarea
                  name="notes"
                  value={driverData.notes}
                  onChange={handleDriverInputChange}
                  placeholder="Observaciones adicionales..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setStep('user')}
                  className="flex-1"
                >
                  Anterior
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Creando Conductor...' : 'Crear Conductor'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
