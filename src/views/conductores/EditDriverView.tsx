'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DriversService } from '@/services/driversService'
import { UpdateDriverDto, LicenseCategory, BloodType } from '@/types/driverTypes'
import { LicenseInfoSection } from '@/components/forms/LicenseInfoSection'
import { MedicalInfoSection } from '@/components/forms/MedicalInfoSection'
import { EmergencyContactSection } from '@/components/forms/EmergencyContactSection'
import { FileUpload } from '@/components/ui/FileUpload'
import { UserCog, ArrowLeft, Save, FileText } from 'lucide-react'

interface EditDriverViewProps {
  driverId: number
}

export const EditDriverView = ({ driverId }: EditDriverViewProps) => {
  const router = useRouter()
  const driversService = new DriversService()

  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [licensePhoto, setLicensePhoto] = useState<File | null>(null)
  const [driverName, setDriverName] = useState('')
  const [userIdentification, setUserIdentification] = useState('')

  const [driverData, setDriverData] = useState<Omit<UpdateDriverDto, 'id_user'>>({
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

  useEffect(() => {
    loadDriver()
  }, [driverId])

  const loadDriver = async () => {
    setIsFetching(true)
    const driver = await driversService.getDriverById(driverId)

    if (driver) {
      setDriverName(`${driver.first_name || ''} ${driver.last_name || ''}`.trim())
      setUserIdentification(driver.license_number || '')

      // Parse license_categories - comes as comma-separated string from raw SQL
      let categories: LicenseCategory[] = []
      if (driver.license_categories) {
        if (Array.isArray(driver.license_categories)) {
          categories = driver.license_categories
        } else if (typeof driver.license_categories === 'string') {
          categories = (driver.license_categories as string)
            .split(',')
            .map(c => c.trim())
            .filter(Boolean) as LicenseCategory[]
        }
      }

      setDriverData({
        license_number: driver.license_number || '',
        license_categories: categories,
        license_issue_date: driver.license_issue_date ? driver.license_issue_date.split('T')[0] : '',
        license_expiry_date: driver.license_expiry_date ? driver.license_expiry_date.split('T')[0] : '',
        license_issuing_authority: driver.license_issuing_authority || '',
        blood_type: driver.blood_type || '' as BloodType,
        medical_certificate_date: driver.medical_certificate_date ? driver.medical_certificate_date.split('T')[0] : '',
        medical_certificate_expiry: driver.medical_certificate_expiry ? driver.medical_certificate_expiry.split('T')[0] : '',
        medical_restrictions: driver.medical_restrictions || '',
        emergency_contact_name: driver.emergency_contact_name || '',
        emergency_contact_relationship: driver.emergency_contact_relationship || '',
        emergency_contact_phone: driver.emergency_contact_phone || '',
        address: driver.address || '',
        notes: driver.notes || ''
      })
    }

    setIsFetching(false)
  }

  const handleDriverDataChange = (field: string, value: any) => {
    setDriverData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (driverData.license_categories && driverData.license_categories.length === 0) {
        throw new Error('Debe seleccionar al menos una categoria de licencia')
      }

      const result = await driversService.updateDriver(driverId, driverData as UpdateDriverDto)

      if (!result) {
        throw new Error('Error al actualizar conductor')
      }

      // Upload new license photo if provided
      if (licensePhoto) {
        const uploadSuccess = await driversService.uploadDriverLicense(driverId, licensePhoto)
        if (!uploadSuccess) {
          console.warn('La licencia no se pudo subir, pero el conductor fue actualizado')
        }
      }

      router.push('/dashboard/empleados/conductores')
    } catch (error) {
      console.error('Error al actualizar conductor:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Cargando conductor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Banner header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0A1628] to-[#001F3F] p-8 text-white">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500 rounded-full mix-blend-screen blur-[80px] opacity-20" />
        <div className="relative z-10">
          <button
            onClick={() => router.push('/dashboard/empleados/conductores')}
            className="flex items-center gap-1 text-cyan-300/70 hover:text-cyan-300 transition-colors mb-4 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a conductores
          </button>
          <div className="flex items-center gap-2 mb-2">
            <UserCog className="w-5 h-5 text-cyan-400" />
            <span className="text-cyan-300 text-sm font-medium">Edicion de Personal</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Editar Conductor</h1>
          <p className="text-blue-200/70 text-sm max-w-md">
            {driverName ? `Editando informacion de ${driverName}` : 'Modifique la informacion del conductor'}
          </p>
        </div>
      </div>

      {/* Form container */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* License Info Section */}
            <div className="bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm">
              <LicenseInfoSection
                data={{
                  license_number: driverData.license_number || '',
                  license_categories: driverData.license_categories || [],
                  license_issue_date: driverData.license_issue_date || '',
                  license_expiry_date: driverData.license_expiry_date || '',
                  license_issuing_authority: driverData.license_issuing_authority || ''
                }}
                onChange={handleDriverDataChange}
                userIdentification={userIdentification}
              />

              <div className="mt-6 pt-6 border-t border-slate-200/60">
                <FileUpload
                  label="Actualizar Foto de la Licencia"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  maxSizeMB={5}
                  onFileSelect={setLicensePhoto}
                  helperText="Formato: JPG, PNG, PDF. Tamano maximo: 5MB. Deje vacio para mantener la foto actual."
                />
              </div>
            </div>

            {/* Medical Info Section */}
            <div className="bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm">
              <MedicalInfoSection
                data={{
                  blood_type: driverData.blood_type || '' as BloodType,
                  medical_certificate_date: driverData.medical_certificate_date || '',
                  medical_certificate_expiry: driverData.medical_certificate_expiry || '',
                  medical_restrictions: driverData.medical_restrictions || ''
                }}
                onChange={handleDriverDataChange}
              />
            </div>

            {/* Emergency Contact Section */}
            <div className="bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm">
              <EmergencyContactSection
                data={{
                  emergency_contact_name: driverData.emergency_contact_name || '',
                  emergency_contact_relationship: driverData.emergency_contact_relationship || '',
                  emergency_contact_phone: driverData.emergency_contact_phone || '',
                  address: driverData.address || ''
                }}
                onChange={handleDriverDataChange}
              />
            </div>

            {/* Notes Section */}
            <div className="bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm">
              <div className="space-y-2">
                <div className="mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Notas Adicionales</h3>
                      <p className="text-sm text-slate-500">Observaciones o informacion adicional sobre el conductor</p>
                    </div>
                  </div>
                </div>

                <textarea
                  name="notes"
                  value={driverData.notes || ''}
                  onChange={(e) => handleDriverDataChange('notes', e.target.value)}
                  placeholder="Ej: Conductor con amplia experiencia en rutas nacionales..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all resize-none"
                />
                <p className="text-xs text-slate-400">
                  Opcional: Informacion adicional que considere relevante
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push('/dashboard/empleados/conductores')}
                disabled={isLoading}
                className="flex-1 py-3 px-6 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-cyan-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? 'Guardando cambios...' : (
                  <>
                    <Save className="w-4 h-4" /> Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
