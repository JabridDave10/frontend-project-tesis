'use client'

import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { FileUpload } from '@/components/ui/FileUpload'
import { RegisterUserDto } from '@/types/userTypes'

interface UserInfoFormProps {
  data: RegisterUserDto
  profilePhoto: File | null
  onDataChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onPhotoChange: (file: File | null) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  isLoading: boolean
}

/**
 * UserInfoForm - Formulario de información básica del usuario
 *
 * Responsabilidad única: Capturar datos del usuario (Paso 1)
 */
export const UserInfoForm = ({
  data,
  profilePhoto,
  onDataChange,
  onPhotoChange,
  onSubmit,
  onCancel,
  isLoading
}: UserInfoFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Tarjeta: Información Personal */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-3xl">👤</span>
            Información Personal
          </h3>
          <p className="text-sm text-gray-600 mt-2 ml-11">
            Datos personales del conductor
          </p>
        </div>

        <div className="space-y-4">
          {/* Nombre y Apellido */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="first_name"
                value={data.first_name}
                onChange={onDataChange}
                placeholder="Nombre"
                required
                minLength={1}
                maxLength={50}
              />
              <p className="text-xs text-gray-500 mt-1">
                Máximo 50 caracteres
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apellido <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="last_name"
                value={data.last_name}
                onChange={onDataChange}
                placeholder="Apellido"
                required
                minLength={1}
                maxLength={50}
              />
              <p className="text-xs text-gray-500 mt-1">
                Máximo 50 caracteres
              </p>
            </div>
          </div>

          {/* Identificación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cédula de Ciudadanía <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              name="identification"
              value={data.identification}
              onChange={onDataChange}
              placeholder="Número de cédula"
              required
              minLength={1}
              maxLength={20}
            />
            <p className="text-xs text-gray-500 mt-1">
              Esta será usada como número de licencia (1-20 caracteres)
            </p>
          </div>

          {/* Fecha de Nacimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Nacimiento <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              name="birthdate"
              value={data.birthdate}
              onChange={onDataChange}
              required
              max={new Date().toISOString().split('T')[0]}
            />
            <p className="text-xs text-gray-500 mt-1">
              Debe ser mayor de 18 años
            </p>
          </div>
        </div>
      </div>

      {/* Tarjeta: Información de Contacto */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-3xl">📧</span>
            Información de Contacto
          </h3>
          <p className="text-sm text-gray-600 mt-2 ml-11">
            Datos para comunicación
          </p>
        </div>

        <div className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              name="email"
              value={data.email}
              onChange={onDataChange}
              placeholder="ejemplo@correo.com"
              required
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono / Celular <span className="text-red-500">*</span>
            </label>
            <Input
              type="tel"
              name="phone"
              value={data.phone}
              onChange={onDataChange}
              placeholder="3001234567"
              required
              minLength={1}
              maxLength={11}
            />
            <p className="text-xs text-gray-500 mt-1">
              1-11 caracteres
            </p>
          </div>
        </div>
      </div>

      {/* Tarjeta: Seguridad */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-3xl">🔐</span>
            Seguridad
          </h3>
          <p className="text-sm text-gray-600 mt-2 ml-11">
            Contraseña para acceso al sistema
          </p>
        </div>

        <div className="space-y-4">
          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña <span className="text-red-500">*</span>
            </label>
            <Input
              type="password"
              name="password"
              value={data.password}
              onChange={onDataChange}
              placeholder="Contraseña segura"
              required
              minLength={6}
              maxLength={20}
            />
            <p className="text-xs text-gray-500 mt-1">
              6-20 caracteres, se recomienda incluir números y símbolos
            </p>
          </div>
        </div>
      </div>

      {/* Tarjeta: Foto de Perfil */}
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-3xl">📷</span>
            Foto de Perfil
          </h3>
          <p className="text-sm text-gray-600 mt-2 ml-11">
            Fotografía del conductor (opcional)
          </p>
        </div>

        <FileUpload
          label=""
          accept="image/jpeg,image/jpg,image/png"
          maxSizeMB={5}
          onFileSelect={onPhotoChange}
          helperText="Formato: JPG, PNG. Tamaño máximo: 5MB. Esta foto será usada en el perfil del conductor."
        />
      </div>

      {/* Botones de Acción */}
      <div className="flex gap-4 pt-6">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="flex-1"
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Guardando...' : 'Siguiente →'}
        </Button>
      </div>
    </form>
  )
}
