'use client'

import { Input } from '@/components/ui/Input'
import { MultiSelectLicenseCategories } from '@/components/ui/MultiSelectLicenseCategories'
import { LicenseCategory, ISSUING_AUTHORITIES } from '@/types/driverTypes'

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
  userIdentification: string // Para pre-llenar el número de licencia
}

export const LicenseInfoSection = ({
  data,
  onChange,
  userIdentification
}: LicenseInfoSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-3xl">📄</span>
          Información de Licencia
        </h3>
        <p className="text-sm text-gray-600 mt-2 ml-11">
          Datos de la licencia de conducción del conductor
        </p>
      </div>

      {/* Número de Licencia */}
      <div>
        <Input
          type="text"
          name="license_number"
          value={data.license_number}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '') // Solo números
            if (value.length <= 10) {
              onChange('license_number', value)
            }
          }}
          placeholder="Número de Licencia"
          required
          maxLength={10}
        />
        <p className="text-xs text-gray-500 mt-1">
          En Colombia, el número de licencia coincide con la cédula. {userIdentification && `(${userIdentification})`}
        </p>
      </div>

      {/* Categorías de Licencia */}
      <MultiSelectLicenseCategories
        selectedCategories={data.license_categories}
        onChange={(categories) => onChange('license_categories', categories)}
        required
      />

      {/* Fechas de Licencia */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Expedición <span className="text-red-500">*</span>
          </label>
          <Input
            type="date"
            name="license_issue_date"
            value={data.license_issue_date}
            onChange={(e) => onChange('license_issue_date', e.target.value)}
            required
            max={new Date().toISOString().split('T')[0]} // No puede ser futura
          />
          <p className="text-xs text-gray-500 mt-1">
            Fecha en que se expidió la licencia
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Vencimiento <span className="text-red-500">*</span>
          </label>
          <Input
            type="date"
            name="license_expiry_date"
            value={data.license_expiry_date}
            onChange={(e) => onChange('license_expiry_date', e.target.value)}
            required
            min={new Date().toISOString().split('T')[0]} // No puede ser pasada
          />
          <p className="text-xs text-gray-500 mt-1">
            Fecha de vencimiento de la licencia
          </p>
        </div>
      </div>

      {/* Organismo Emisor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Organismo de Tránsito Emisor <span className="text-red-500">*</span>
        </label>
        <select
          name="license_issuing_authority"
          value={data.license_issuing_authority}
          onChange={(e) => onChange('license_issuing_authority', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          required
        >
          <option value="">Seleccione el organismo emisor</option>
          {ISSUING_AUTHORITIES.map((authority) => (
            <option key={authority} value={authority}>
              {authority}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Secretaría o entidad que expidió la licencia
        </p>
      </div>

      {/* Validación de fechas */}
      {data.license_issue_date && data.license_expiry_date &&
       new Date(data.license_issue_date) >= new Date(data.license_expiry_date) && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            ⚠️ La fecha de vencimiento debe ser posterior a la fecha de expedición
          </p>
        </div>
      )}

      {/* Warning si tiene categorías de servicio público */}
      {data.license_categories.some(c => ['C1', 'C2', 'C3'].includes(c)) && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ℹ️ Este conductor tiene categorías de servicio público (C1, C2 o C3).
            Puede tener una fecha de vencimiento diferente para servicio público.
          </p>
        </div>
      )}
    </div>
  )
}
