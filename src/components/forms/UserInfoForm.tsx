'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FileUpload } from '@/components/ui/FileUpload'
import { RegisterUserDto } from '@/types/userTypes'
import { User, Mail, Lock, Camera, ArrowRight } from 'lucide-react'

interface UserInfoFormProps {
  data: RegisterUserDto
  profilePhoto: File | null
  onDataChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onPhotoChange: (file: File | null) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  isLoading: boolean
}

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
      {/* Section: Personal Information */}
      <div className="bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Informacion Personal</h3>
              <p className="text-sm text-slate-500">Datos personales del conductor</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
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
                className="bg-slate-50 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
              <p className="text-xs text-slate-400 mt-1">Maximo 50 caracteres</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
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
                className="bg-slate-50 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
              <p className="text-xs text-slate-400 mt-1">Maximo 50 caracteres</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Cedula de Ciudadania <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              name="identification"
              value={data.identification}
              onChange={onDataChange}
              placeholder="Numero de cedula"
              required
              minLength={1}
              maxLength={20}
              className="bg-slate-50 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
            <p className="text-xs text-slate-400 mt-1">
              Esta sera usada como numero de licencia (1-20 caracteres)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Fecha de Nacimiento <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              name="birthdate"
              value={data.birthdate}
              onChange={onDataChange}
              required
              max={new Date().toISOString().split('T')[0]}
              className="bg-slate-50 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
            <p className="text-xs text-slate-400 mt-1">Debe ser mayor de 18 anos</p>
          </div>
        </div>
      </div>

      {/* Section: Contact Information */}
      <div className="bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Informacion de Contacto</h3>
              <p className="text-sm text-slate-500">Datos para comunicacion</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Correo Electronico <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              name="email"
              value={data.email}
              onChange={onDataChange}
              placeholder="ejemplo@correo.com"
              required
              className="bg-slate-50 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Telefono / Celular <span className="text-red-500">*</span>
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
              className="bg-slate-50 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
            <p className="text-xs text-slate-400 mt-1">1-11 caracteres</p>
          </div>
        </div>
      </div>

      {/* Section: Security */}
      <div className="bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Seguridad</h3>
              <p className="text-sm text-slate-500">Contrasena para acceso al sistema</p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Contrasena <span className="text-red-500">*</span>
          </label>
          <Input
            type="password"
            name="password"
            value={data.password}
            onChange={onDataChange}
            placeholder="Contrasena segura"
            required
            minLength={6}
            maxLength={20}
            className="bg-slate-50 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
          />
          <p className="text-xs text-slate-400 mt-1">
            6-20 caracteres, se recomienda incluir numeros y simbolos
          </p>
        </div>
      </div>

      {/* Section: Profile Photo */}
      <div className="bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Foto de Perfil</h3>
              <p className="text-sm text-slate-500">Fotografia del conductor (opcional)</p>
            </div>
          </div>
        </div>

        <FileUpload
          label=""
          accept="image/jpeg,image/jpg,image/png"
          maxSizeMB={5}
          onFileSelect={onPhotoChange}
          helperText="Formato: JPG, PNG. Tamano maximo: 5MB. Esta foto sera usada en el perfil del conductor."
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 py-3 px-6 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-all disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-cyan-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? 'Guardando...' : (
            <>Siguiente <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </div>
    </form>
  )
}
