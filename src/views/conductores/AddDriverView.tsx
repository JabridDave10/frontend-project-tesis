'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DriversService } from '@/services/driversService'
import { AxiosUserManagement } from '@/services/axiosRegister'
import { CreateDriverDto, LicenseCategory, BloodType } from '@/types/driverTypes'
import { RegisterUserDto } from '@/types/userTypes'
import { UserInfoForm } from '@/components/forms/UserInfoForm'
import { DriverInfoForm } from '@/components/forms/DriverInfoForm'
import { UserPlus, CheckCircle2 } from 'lucide-react'

export const AddDriverView = () => {
  const router = useRouter()
  const driversService = new DriversService()
  const userService = new AxiosUserManagement()

  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'user' | 'driver'>('user')
  const [createdUserId, setCreatedUserId] = useState<number | null>(null)

  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [licensePhoto, setLicensePhoto] = useState<File | null>(null)

  const [userData, setUserData] = useState<RegisterUserDto>({
    first_name: '',
    last_name: '',
    identification: '',
    birthdate: '',
    email: '',
    phone: '',
    password: '',
    photo: '',
    id_role: 2
  })

  const [driverData, setDriverData] = useState<Omit<CreateDriverDto, 'id_user'>>({
    license_number: '',
    license_categories: [],
    license_issue_date: '',
    license_expiry_date: '',
    license_issuing_authority: '',
    blood_type: '' as BloodType,
    medical_certificate_date: '',
    medical_certificate_expiry: '',
    medical_restrictions: '',
    emergency_contact_name: '',
    emergency_contact_relationship: '',
    emergency_contact_phone: '',
    address: '',
    notes: ''
  })

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

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await userService.registerUser(userData)
      if (!result) {
        throw new Error('Error al crear usuario')
      }

      const userStr = localStorage.getItem('user')
      if (!userStr) {
        throw new Error('No se encontro el usuario creado')
      }

      const user = JSON.parse(userStr)
      setCreatedUserId(user.id)

      setDriverData(prev => ({
        ...prev,
        license_number: userData.identification
      }))

      if (profilePhoto) {
        const uploadSuccess = await driversService.uploadUserPhoto(user.id, profilePhoto)
        if (!uploadSuccess) {
          console.warn('La foto de perfil no se pudo subir, pero continuamos...')
        }
      }

      setStep('driver')
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
      if (!createdUserId) {
        throw new Error('No se encontro el ID del usuario')
      }

      if (driverData.license_categories.length === 0) {
        throw new Error('Debe seleccionar al menos una categoria de licencia')
      }

      const driverDto: CreateDriverDto = {
        id_user: createdUserId,
        ...driverData
      }

      const result = await driversService.createDriver(driverDto)
      if (!result) {
        throw new Error('Error al crear conductor')
      }

      if (licensePhoto && result.id_driver) {
        const uploadSuccess = await driversService.uploadDriverLicense(result.id_driver, licensePhoto)
        if (!uploadSuccess) {
          console.warn('La licencia no se pudo subir, pero el conductor fue creado')
        }
      }

      router.push('/dashboard/empleados/conductores')
    } catch (error) {
      console.error('Error al crear conductor:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Banner header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0A1628] to-[#001F3F] p-8 text-white">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500 rounded-full mix-blend-screen blur-[80px] opacity-20" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <UserPlus className="w-5 h-5 text-cyan-400" />
            <span className="text-cyan-300 text-sm font-medium">Registro de Personal</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Agregar Conductor</h1>
          <p className="text-blue-200/70 text-sm max-w-md">
            {step === 'user' ? 'Paso 1: Completa la informacion basica del usuario' : 'Paso 2: Completa la informacion del conductor'}
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center py-2">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
            step === 'user'
              ? 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/20'
              : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
          }`}>
            {step === 'driver' ? <CheckCircle2 className="w-5 h-5" /> : '1'}
          </div>
          <div className={`w-20 h-1 rounded-full transition-all ${step === 'driver' ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' : 'bg-slate-200'}`} />
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
            step === 'driver'
              ? 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/20'
              : 'bg-slate-100 text-slate-400'
          }`}>
            2
          </div>
        </div>
      </div>

      {/* Form container */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-xl p-8">
          {step === 'user' ? (
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
