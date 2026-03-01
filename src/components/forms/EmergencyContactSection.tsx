'use client'

import { Input } from '@/components/ui/input'
import { Phone } from 'lucide-react'

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
    return value.replace(/\D/g, '').slice(0, 10)
  }

  const isValidPhone = (phone: string) => {
    return phone.length === 10
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
            <Phone className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Contacto de Emergencia</h3>
            <p className="text-sm text-slate-500">Persona a contactar en caso de emergencia</p>
          </div>
        </div>
      </div>

      {/* Contact Name */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Nombre Completo <span className="text-red-500">*</span>
        </label>
        <Input
          type="text"
          name="emergency_contact_name"
          value={data.emergency_contact_name}
          onChange={(e) => onChange('emergency_contact_name', e.target.value)}
          placeholder="Ej: Maria Lopez Perez"
          required
          className="bg-slate-50 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
        />
      </div>

      {/* Relationship */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Parentesco <span className="text-red-500">*</span>
        </label>
        <select
          name="emergency_contact_relationship"
          value={data.emergency_contact_relationship}
          onChange={(e) => onChange('emergency_contact_relationship', e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all"
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

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Telefono / Celular <span className="text-red-500">*</span>
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
          minLength={10}
          maxLength={10}
          className="bg-slate-50 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
        />
        <p className="text-xs text-slate-400 mt-1">
          Exactamente 10 digitos sin espacios ni guiones (solo numeros)
        </p>
        {data.emergency_contact_phone &&
!isValidPhone(data.emergency_contact_phone) && (
          <p className="text-xs text-red-500 mt-1">
            El telefono debe tener exactamente 10 digitos
          </p>
        )}
      </div>

      {/* Separator */}
      <div className="border-t border-slate-200/60 my-4"></div>

      {/* Driver Address */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Direccion de Residencia del Conductor (Opcional)
        </label>
        <Input
          type="text"
          name="address"
          value={data.address}
          onChange={(e) => onChange('address', e.target.value)}
          placeholder="Ej: Calle 123 #45-67, Bogota"
          className="bg-slate-50 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
        />
        <p className="text-xs text-slate-400 mt-1">
          Direccion completa donde reside el conductor
        </p>
      </div>

      {/* Info box */}
      <div className="p-3 bg-blue-50/60 border border-blue-200/40 rounded-xl">
        <p className="text-xs text-blue-700">
          Esta informacion es crucial en caso de emergencias. Asegurese de que los datos sean correctos y esten actualizados.
        </p>
      </div>
    </div>
  )
}
