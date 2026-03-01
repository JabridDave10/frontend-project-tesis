'use client'

import { Button } from '@/components/ui/button'
import { FileUpload } from '@/components/ui/FileUpload'
import { LicenseInfoSection } from './LicenseInfoSection'
import { MedicalInfoSection } from './MedicalInfoSection'
import { EmergencyContactSection } from './EmergencyContactSection'
import { CreateDriverDto, LicenseCategory, BloodType } from '@/types/driverTypes'
import { FileText, ArrowLeft, ArrowRight } from 'lucide-react'

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
      {/* License Info Section */}
      <div className="bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm">
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

        <div className="mt-6 pt-6 border-t border-slate-200/60">
          <FileUpload
            label="Foto de la Licencia de Conduccion"
            accept="image/jpeg,image/jpg,image/png,application/pdf"
            maxSizeMB={5}
            onFileSelect={onLicensePhotoChange}
            helperText="Formato: JPG, PNG, PDF. Tamano maximo: 5MB. Asegurese de que la foto sea legible."
          />
        </div>
      </div>

      {/* Medical Info Section */}
      <div className="bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm">
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

      {/* Emergency Contact Section */}
      <div className="bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm">
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
            value={data.notes || ''}
            onChange={(e) => onDataChange('notes', e.target.value)}
            placeholder="Ej: Conductor con amplia experiencia en rutas nacionales, buen desempeno en cargas refrigeradas..."
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
          onClick={onBack}
          disabled={isLoading}
          className="flex-1 py-3 px-6 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Anterior
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-cyan-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? 'Creando Conductor...' : (
            <>Crear Conductor <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </div>
    </form>
  )
}
