'use client'

import { Input } from '@/components/ui/input'
import { BloodType, BLOOD_TYPE_OPTIONS } from '@/types/driverTypes'
import { HeartPulse } from 'lucide-react'

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
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
            <HeartPulse className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Informacion Medica</h3>
            <p className="text-sm text-slate-500">Certificado medico de aptitud y grupo sanguineo (obligatorio por ley)</p>
          </div>
        </div>
      </div>

      {/* Blood Type */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Grupo Sanguineo <span className="text-red-500">*</span>
        </label>
        <select
          name="blood_type"
          value={data.blood_type}
          onChange={(e) => onChange('blood_type', e.target.value as BloodType)}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all"
          required
        >
          <option value="">Seleccione el grupo sanguineo</option>
          {BLOOD_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-400 mt-1">Requerido por ley colombiana para conductores</p>
      </div>

      {/* Medical Certificate Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Fecha Certificado Medico <span className="text-red-500">*</span>
          </label>
          <Input
            type="date"
            name="medical_certificate_date"
            value={data.medical_certificate_date}
            onChange={(e) => onChange('medical_certificate_date', e.target.value)}
            required
            max={new Date().toISOString().split('T')[0]}
            className="bg-slate-50 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
          />
          <p className="text-xs text-slate-400 mt-1">Fecha de expedicion del certificado</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Vencimiento Certificado <span className="text-red-500">*</span>
          </label>
          <Input
            type="date"
            name="medical_certificate_expiry"
            value={data.medical_certificate_expiry}
            onChange={(e) => onChange('medical_certificate_expiry', e.target.value)}
            required
            min={new Date().toISOString().split('T')[0]}
            className="bg-slate-50 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
          />
          <p className="text-xs text-slate-400 mt-1">Usualmente 1 ano desde expedicion</p>
        </div>
      </div>

      {/* Date Validation */}
      {data.medical_certificate_date && data.medical_certificate_expiry &&
       new Date(data.medical_certificate_date) >= new Date(data.medical_certificate_expiry) && (
        <div className="p-3 bg-red-50 border border-red-200/60 rounded-xl">
          <p className="text-sm text-red-700">
            La fecha de vencimiento debe ser posterior a la fecha de expedicion
          </p>
        </div>
      )}

      {/* Expiry Alert */}
      {daysUntilExpiry !== null && daysUntilExpiry <= 30 && (
        <div className={`p-3 border rounded-xl ${
          daysUntilExpiry < 0
            ? 'bg-red-50 border-red-200/60'
            : daysUntilExpiry <= 7
            ? 'bg-orange-50 border-orange-200/60'
            : 'bg-amber-50 border-amber-200/60'
        }`}>
          <p className={`text-sm ${
            daysUntilExpiry < 0
              ? 'text-red-700'
              : daysUntilExpiry <= 7
              ? 'text-orange-700'
              : 'text-amber-700'
          }`}>
            {daysUntilExpiry < 0
              ? `El certificado medico esta vencido (hace ${Math.abs(daysUntilExpiry)} dias)`
              : daysUntilExpiry === 0
              ? 'El certificado medico vence HOY'
              : `El certificado medico vence en ${daysUntilExpiry} dia${daysUntilExpiry === 1 ? '' : 's'}`
            }
          </p>
        </div>
      )}

      {/* Medical Restrictions */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Restricciones Medicas (Opcional)
        </label>
        <textarea
          name="medical_restrictions"
          value={data.medical_restrictions}
          onChange={(e) => onChange('medical_restrictions', e.target.value)}
          placeholder="Ej: Uso de lentes correctivos, uso de audifono, etc."
          rows={3}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all resize-none"
        />
        <p className="text-xs text-slate-400 mt-1">
          Indique si el conductor tiene alguna restriccion medica (uso de lentes, audifonos, etc.)
        </p>
      </div>
    </div>
  )
}
