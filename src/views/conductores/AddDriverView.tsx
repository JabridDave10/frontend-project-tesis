'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DriversService } from '@/services/driversService'
import { AxiosUserManagement } from '@/services/axiosRegister'
import { CreateDriverDto, LicenseCategory, BloodType } from '@/types/driverTypes'
import { RegisterUserDto } from '@/types/userTypes'
import { UserInfoForm } from '@/components/forms/UserInfoForm'
import { DriverInfoForm } from '@/components/forms/DriverInfoForm'

/**
 * AddDriverView - Orquestador principal del flujo de creación de conductor
 *
 * Responsabilidades:
 * 1. Gestionar el estado global del flujo (2 pasos)
 * 2. Coordinar llamadas a servicios (usuario, conductor, fotos)
 * 3. Navegar entre pasos
 * 4. Manejar estados de carga y errores globales
 */
export const AddDriverView = () => {
  const router = useRouter()
  const driversService = new DriversService()
  const userService = new AxiosUserManagement()

  // Estados de control del flujo
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'user' | 'driver'>('user')
  const [createdUserId, setCreatedUserId] = useState<number | null>(null)

  // Archivos seleccionados
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [licensePhoto, setLicensePhoto] = useState<File | null>(null)

  // Datos del usuario (Paso 1)
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

  // Datos del conductor (Paso 2) - Versión CORE
  const [driverData, setDriverData] = useState<Omit<CreateDriverDto, 'id_user'>>({
    // Información de Licencia
    license_number: '',
    license_categories: [],
    license_issue_date: '',
    license_expiry_date: '',
    license_issuing_authority: '',

    // Información Médica
    blood_type: '' as BloodType,
    medical_certificate_date: '',
    medical_certificate_expiry: '',
    medical_restrictions: '',

    // Contacto de Emergencia
    emergency_contact_name: '',
    emergency_contact_relationship: '',
    emergency_contact_phone: '',

    // Otros
    address: '',
    notes: ''
  })

  // ==================== HANDLERS ====================

  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setUserData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleDriverDataChange = (field: string, value: any) => {
    setDriverData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // ==================== PASO 1: CREAR USUARIO ====================

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // 1. Crear usuario
      const result = await userService.registerUser(userData)
      if (!result) {
        throw new Error('Error al crear usuario')
      }

      // 2. Obtener el ID del usuario creado
      const userStr = localStorage.getItem('user')
      if (!userStr) {
        throw new Error('No se encontró el usuario creado')
      }

      const user = JSON.parse(userStr)
      setCreatedUserId(user.id)

      // 3. Pre-llenar el número de licencia con la cédula
      setDriverData(prev => ({
        ...prev,
        license_number: userData.identification
      }))

      // 4. Si hay foto de perfil, subirla
      if (profilePhoto) {
        const uploadSuccess = await driversService.uploadUserPhoto(user.id, profilePhoto)
        if (!uploadSuccess) {
          console.warn('La foto de perfil no se pudo subir, pero continuamos...')
        }
      }

      // 5. Pasar al siguiente paso
      setStep('driver')
    } catch (error) {
      console.error('Error al crear usuario:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // ==================== PASO 2: CREAR CONDUCTOR ====================

  const handleDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // 1. Verificar que tenemos el ID del usuario
      if (!createdUserId) {
        throw new Error('No se encontró el ID del usuario')
      }

      // 2. Validar que las categorías no estén vacías
      if (driverData.license_categories.length === 0) {
        throw new Error('Debe seleccionar al menos una categoría de licencia')
      }

      // 3. Crear conductor (sin foto de licencia)
      const driverDto: CreateDriverDto = {
        id_user: createdUserId,
        ...driverData
      }

      const result = await driversService.createDriver(driverDto)
      if (!result) {
        throw new Error('Error al crear conductor')
      }

      // 4. Si hay foto de licencia, subirla
      if (licensePhoto && result.id_driver) {
        const uploadSuccess = await driversService.uploadDriverLicense(result.id_driver, licensePhoto)
        if (!uploadSuccess) {
          console.warn('La licencia no se pudo subir, pero el conductor fue creado')
        }
      }

      // 5. Redirigir a la lista de conductores
      router.push('/dashboard/empleados/conductores')
    } catch (error) {
      console.error('Error al crear conductor:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // ==================== RENDERIZADO ====================

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Agregar Conductor</h1>
          <p className="text-gray-600">
            {step === 'user' ? 'Paso 1: Información del Usuario' : 'Paso 2: Información del Conductor'}
          </p>
        </div>

        {/* Indicador de pasos */}
        <div className="mb-8 flex items-center justify-center">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'user' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
            }`}>
              1
            </div>
            <div className={`w-24 h-1 ${step === 'driver' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'driver' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {step === 'user' ? (
            /* ===== PASO 1: FORMULARIO DE USUARIO (REFACTORIZADO) ===== */
            <UserInfoForm
              data={userData}
              profilePhoto={profilePhoto}
              onDataChange={handleUserInputChange}
              onPhotoChange={setProfilePhoto}
              onSubmit={handleUserSubmit}
              onCancel={() => router.push('/dashboard/empleados/conductores')}
              isLoading={isLoading}
            />
          ) : (
            /* ===== PASO 2: FORMULARIO DE CONDUCTOR (REFACTORIZADO) ===== */
            <DriverInfoForm
              data={driverData}
              userIdentification={userData.identification}
              licensePhoto={licensePhoto}
              onDataChange={handleDriverDataChange}
              onLicensePhotoChange={setLicensePhoto}
              onSubmit={handleDriverSubmit}
              onBack={() => setStep('user')}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  )
}
