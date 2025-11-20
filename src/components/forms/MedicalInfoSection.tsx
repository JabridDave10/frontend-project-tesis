'use client'

import { Input } from '@/components/ui/input'
import { BloodType, BLOOD_TYPE_OPTIONS } from '@/types/driverTypes'

interface MedicalInfoData {
  blood_type: BloodType | ''
  medical_certificate_date: string
  medical_certificate_expiry: string
  medical_restrictions: string
}

interface MedicalInfoSectionProps {
  data: MedicalInfoData
  onChange: (field: keyof MedicalInfoData, value: any) => void
}

export const MedicalInfoSection = ({
  data,
  onChange
}: MedicalInfoSectionProps) => {
  // Calcular si el certificado está próximo a vencer
  const getDaysUntilExpiry = () => {
    if (!data.medical_certificate_expiry) return null
    const today = new Date()
    const expiry = new Date(data.medical_certificate_expiry)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysUntilExpiry = getDaysUntilExpiry()

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-3xl">⚕️</span>
          Información Médica
        </h3>
        <p className="text-sm text-gray-600 mt-2 ml-11">
          Certificado médico de aptitud y grupo sanguíneo (obligatorio por ley)
        </p>
      </div>

      {/* Grupo Sanguíneo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Grupo Sanguíneo <span className="text-red-500">*</span>
        </label>
        <select
          name="blood_type"
          value={data.blood_type}
          onChange={(e) => onChange('blood_type', e.target.value as BloodType)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          required
        >
          <option value="">Seleccione el grupo sanguíneo</option>
          {BLOOD_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Requerido por ley colombiana para conductores
        </p>
      </div>

      {/* Fechas de Certificado Médico */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha Certificado Médico <span className="text-red-500">*</span>
          </label>
          <Input
            type="date"
            name="medical_certificate_date"
            value={data.medical_certificate_date}
            onChange={(e) => onChange('medical_certificate_date', e.target.value)}
            required
            max={new Date().toISOString().split('T')[0]}
          />
          <p className="text-xs text-gray-500 mt-1">
            Fecha de expedición del certificado
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vencimiento Certificado <span className="text-red-500">*</span>
          </label>
          <Input
            type="date"
            name="medical_certificate_expiry"
            value={data.medical_certificate_expiry}
            onChange={(e) => onChange('medical_certificate_expiry', e.target.value)}
            required
            min={new Date().toISOString().split('T')[0]}
          />
          <p className="text-xs text-gray-500 mt-1">
            Usualmente 1 año desde expedición
          </p>
        </div>
      </div>

      {/* Validación de fechas del certificado */}
      {data.medical_certificate_date && data.medical_certificate_expiry &&
       new Date(data.medical_certificate_date) >= new Date(data.medical_certificate_expiry) && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            ⚠️ La fecha de vencimiento debe ser posterior a la fecha de expedición
          </p>
        </div>
      )}

      {/* Alerta si el certificado está próximo a vencer o vencido */}
      {daysUntilExpiry !== null && daysUntilExpiry <= 30 && (
        <div className={`p-3 border rounded-lg ${
          daysUntilExpiry < 0
            ? 'bg-red-50 border-red-200'
            : daysUntilExpiry <= 7
            ? 'bg-orange-50 border-orange-200'
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <p className={`text-sm ${
            daysUntilExpiry < 0
              ? 'text-red-800'
              : daysUntilExpiry <= 7
              ? 'text-orange-800'
              : 'text-yellow-800'
          }`}>
            {daysUntilExpiry < 0
              ? `⛔ El certificado médico está vencido (hace ${Math.abs(daysUntilExpiry)} días)`
              : daysUntilExpiry === 0
              ? '⚠️ El certificado médico vence HOY'
              : `⚠️ El certificado médico vence en ${daysUntilExpiry} día${daysUntilExpiry === 1 ? '' : 's'}`
            }
          </p>
        </div>
      )}

      {/* Restricciones Médicas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Restricciones Médicas (Opcional)
        </label>
        <textarea
          name="medical_restrictions"
          value={data.medical_restrictions}
          onChange={(e) => onChange('medical_restrictions', e.target.value)}
          placeholder="Ej: Uso de lentes correctivos, uso de audífono, etc."
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Indique si el conductor tiene alguna restricción médica (uso de lentes, audífonos, etc.)
        </p>
      </div>
    </div>
  )
}
