'use client'

import { Button } from '@/components/ui/Button'
import { FileUpload } from '@/components/ui/FileUpload'
import { LicenseInfoSection } from './LicenseInfoSection'
import { MedicalInfoSection } from './MedicalInfoSection'
import { EmergencyContactSection } from './EmergencyContactSection'
import { CreateDriverDto, LicenseCategory, BloodType } from '@/types/driverTypes'

interface DriverInfoFormProps {
  data: Omit<CreateDriverDto, 'id_user'>
  userIdentification: string
  licensePhoto: File | null
  onDataChange: (field: string, value: any) => void
  onLicensePhotoChange: (file: File | null) => void
  onSubmit: (e: React.FormEvent) => void
  onBack: () => void
  isLoading: boolean
}

export const DriverInfoForm = ({
  data,
  userIdentification,
  licensePhoto,
  onDataChange,
  onLicensePhotoChange,
  onSubmit,
  onBack,
  isLoading
}: DriverInfoFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Tarjeta: Información de Licencia */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-sm">
        <LicenseInfoSection
          data={{
            license_number: data.license_number,
            license_categories: data.license_categories,
            license_issue_date: data.license_issue_date,
            license_expiry_date: data.license_expiry_date,
            license_issuing_authority: data.license_issuing_authority
          }}
          onChange={onDataChange}
          userIdentification={userIdentification}
        />

        {/* Foto de Licencia dentro de la misma tarjeta */}
        <div className="mt-6 pt-6 border-t border-blue-300">
          <FileUpload
            label="Foto de la Licencia de Conducción"
            accept="image/jpeg,image/jpg,image/png,application/pdf"
            maxSizeMB={5}
            onFileSelect={onLicensePhotoChange}
            helperText="Formato: JPG, PNG, PDF. Tamaño máximo: 5MB. Asegúrese de que la foto sea legible."
          />
        </div>
      </div>

      {/* Tarjeta: Información Médica */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 shadow-sm">
        <MedicalInfoSection
          data={{
            blood_type: data.blood_type,
            medical_certificate_date: data.medical_certificate_date,
            medical_certificate_expiry: data.medical_certificate_expiry,
            medical_restrictions: data.medical_restrictions || ''
          }}
          onChange={onDataChange}
        />
      </div>

      {/* Tarjeta: Contacto de Emergencia */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm">
        <EmergencyContactSection
          data={{
            emergency_contact_name: data.emergency_contact_name,
            emergency_contact_relationship: data.emergency_contact_relationship,
            emergency_contact_phone: data.emergency_contact_phone,
            address: data.address || ''
          }}
          onChange={onDataChange}
        />
      </div>

      {/* Tarjeta: Notas Adicionales */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="space-y-2">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="text-2xl">📝</span>
              Notas Adicionales
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Observaciones o información adicional sobre el conductor
            </p>
          </div>

          <textarea
            name="notes"
            value={data.notes || ''}
            onChange={(e) => onDataChange('notes', e.target.value)}
            placeholder="Ej: Conductor con amplia experiencia en rutas nacionales, buen desempeño en cargas refrigeradas..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none bg-white"
          />
          <p className="text-xs text-gray-500">
            Opcional: Información adicional que considere relevante
          </p>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex gap-4 pt-6">
        <Button
          type="button"
          variant="secondary"
          onClick={onBack}
          className="flex-1"
          disabled={isLoading}
        >
          ← Anterior
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Creando Conductor...' : 'Crear Conductor →'}
        </Button>
      </div>
    </form>
  )
}
