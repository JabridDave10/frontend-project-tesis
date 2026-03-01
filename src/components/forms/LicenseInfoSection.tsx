'use client'

import { Input } from '@/components/ui/input'
import { MultiSelectLicenseCategories } from '@/components/ui/MultiSelectLicenseCategories'
import { LicenseCategory, ISSUING_AUTHORITIES } from '@/types/driverTypes'
import { FileCheck } from 'lucide-react'

interface LicenseInfoData {
  license_number: string
  license_categories: LicenseCategory[]
  license_issue_date: string
  license_expiry_date: string
  license_issuing_authority: string
}

interface LicenseInfoSectionProps {
  data: LicenseInfoData
  onChange: (field: keyof LicenseInfoData, value: any) => void
  userIdentification: string
}

export const LicenseInfoSection = ({
  data,
  onChange,
  userIdentification
}: LicenseInfoSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
            <FileCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Informacion de Licencia</h3>
            <p className="text-sm text-slate-500">Datos de la licencia de conduccion del conductor</p>
          </div>
        </div>
      </div>

      {/* License Number */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Numero de Licencia <span className="text-red-500">*</span>
        </label>
        <Input
          type="text"
          name="license_number"
          value={data.license_number}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '')
            if (value.length <= 10) {
              onChange('license_number', value)
            }
          }}
          placeholder="Numero de Licencia"
          required
          minLength={4}
          maxLength={10}
          className="bg-slate-50 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
        />
        <p className="text-xs text-slate-400 mt-1">
          4-10 digitos (solo numeros). En Colombia coincide con la cedula. {userIdentification && `(${userIdentification})`}
        </p>
        {data.license_number && (data.license_number.length < 4 || data.license_number.length > 10) && (
          <p className="text-xs text-red-500 mt-1">
            El numero de licencia debe tener entre 4 y 10 digitos
          </p>
        )}
      </div>

      {/* License Categories */}
      <MultiSelectLicenseCategories
        selectedCategories={data.license_categories}
        onChange={(categories) => onChange('license_categories', categories)}
        required
      />

      {/* License Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Fecha de Expedicion <span className="text-red-500">*</span>
          </label>
          <Input
            type="date"
            name="license_issue_date"
            value={data.license_issue_date}
            onChange={(e) => onChange('license_issue_date', e.target.value)}
            required
            max={new Date().toISOString().split('T')[0]}
            className="bg-slate-50 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
          />
          <p className="text-xs text-slate-400 mt-1">Fecha en que se expidio la licencia</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Fecha de Vencimiento <span className="text-red-500">*</span>
          </label>
          <Input
            type="date"
            name="license_expiry_date"
            value={data.license_expiry_date}
            onChange={(e) => onChange('license_expiry_date', e.target.value)}
            required
            min={new Date().toISOString().split('T')[0]}
            className="bg-slate-50 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
          />
          <p className="text-xs text-slate-400 mt-1">Fecha de vencimiento de la licencia</p>
        </div>
      </div>

      {/* Issuing Authority */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Organismo de Transito Emisor <span className="text-red-500">*</span>
        </label>
        <select
          name="license_issuing_authority"
          value={data.license_issuing_authority}
          onChange={(e) => onChange('license_issuing_authority', e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all"
          required
        >
          <option value="">Seleccione el organismo emisor</option>
          {ISSUING_AUTHORITIES.map((authority) => (
            <option key={authority} value={authority}>
              {authority}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-400 mt-1">Secretaria o entidad que expidio la licencia</p>
      </div>

      {/* Date Validation */}
      {data.license_issue_date && data.license_expiry_date &&
       new Date(data.license_issue_date) >= new Date(data.license_expiry_date) && (
        <div className="p-3 bg-red-50 border border-red-200/60 rounded-xl">
          <p className="text-sm text-red-700">
            La fecha de vencimiento debe ser posterior a la fecha de expedicion
          </p>
        </div>
      )}

      {/* Public Service Warning */}
      {data.license_categories.some(c => ['C1', 'C2', 'C3'].includes(c)) && (
        <div className="p-3 bg-amber-50 border border-amber-200/60 rounded-xl">
          <p className="text-sm text-amber-700">
            Este conductor tiene categorias de servicio publico (C1, C2 o C3).
            Puede tener una fecha de vencimiento diferente para servicio publico.
          </p>
        </div>
      )}
    </div>
  )
}
