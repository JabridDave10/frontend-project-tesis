'use client'

import { Input } from '@/components/ui/Input'

interface EmergencyContactData {
  emergency_contact_name: string
  emergency_contact_relationship: string
  emergency_contact_phone: string
  address: string
}

interface EmergencyContactSectionProps {
  data: EmergencyContactData
  onChange: (field: keyof EmergencyContactData, value: string) => void
}

export const EmergencyContactSection = ({
  data,
  onChange
}: EmergencyContactSectionProps) => {
  const formatPhone = (value: string) => {
    // Solo números, máximo 10 dígitos
    return value.replace(/\D/g, '').slice(0, 10)
  }

  const isValidPhone = (phone: string) => {
    return phone.length === 10
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-3xl">🚨</span>
          Contacto de Emergencia
        </h3>
        <p className="text-sm text-gray-600 mt-2 ml-11">
          Persona a contactar en caso de emergencia
        </p>
      </div>

      {/* Nombre del Contacto */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nombre Completo <span className="text-red-500">*</span>
        </label>
        <Input
          type="text"
          name="emergency_contact_name"
          value={data.emergency_contact_name}
          onChange={(e) => onChange('emergency_contact_name', e.target.value)}
          placeholder="Ej: María López Pérez"
          required
        />
      </div>

      {/* Parentesco */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Parentesco <span className="text-red-500">*</span>
        </label>
        <select
          name="emergency_contact_relationship"
          value={data.emergency_contact_relationship}
          onChange={(e) => onChange('emergency_contact_relationship', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          required
        >
          <option value="">Seleccione el parentesco</option>
          <option value="Esposo(a)">Esposo(a)</option>
          <option value="Padre">Padre</option>
          <option value="Madre">Madre</option>
          <option value="Hijo(a)">Hijo(a)</option>
          <option value="Hermano(a)">Hermano(a)</option>
          <option value="Pareja">Pareja</option>
          <option value="Amigo(a)">Amigo(a)</option>
          <option value="Otro">Otro</option>
        </select>
      </div>

      {/* Teléfono */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Teléfono / Celular <span className="text-red-500">*</span>
        </label>
        <Input
          type="tel"
          name="emergency_contact_phone"
          value={data.emergency_contact_phone}
          onChange={(e) => {
            const formatted = formatPhone(e.target.value)
            onChange('emergency_contact_phone', formatted)
          }}
          placeholder="3001234567"
          required
          maxLength={10}
        />
        <p className="text-xs text-gray-500 mt-1">
          Ingrese 10 dígitos sin espacios ni guiones
        </p>
        {data.emergency_contact_phone &&
!isValidPhone(data.emergency_contact_phone) && (
          <p className="text-xs text-red-600 mt-1">
            ⚠️ El teléfono debe tener exactamente 10 dígitos
          </p>
        )}
      </div>

      {/* Separador */}
      <div className="border-t border-gray-100 my-4"></div>

      {/* Dirección del Conductor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dirección de Residencia del Conductor (Opcional)
        </label>
        <Input
          type="text"
          name="address"
          value={data.address}
          onChange={(e) => onChange('address', e.target.value)}
          placeholder="Ej: Calle 123 #45-67, Bogotá"
        />
        <p className="text-xs text-gray-500 mt-1">
          Dirección completa donde reside el conductor
        </p>
      </div>

      {/* Info adicional */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          ℹ️ Esta información es crucial en caso de emergencias. Asegúrese de que los datos sean correctos y estén actualizados.
        </p>
      </div>
    </div>
  )
}
