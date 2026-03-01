'use client'

import { useState } from 'react'
import { AxiosUserManagement } from '@/services/axiosRegister'
import { RegisterUserDto } from '@/types/userTypes'
import { useRouter } from 'next/navigation'
import { User, Mail, Lock, Eye, EyeOff, Calendar, Phone, CreditCard, Truck } from 'lucide-react'
import { AuthHeroPanel } from '@/components/auth/AuthHeroPanel'
import Link from 'next/link'

export const RegisterView = () => {
  const [formData, setFormData] = useState<RegisterUserDto>({
    first_name: '',
    last_name: '',
    identification: '',
    birthdate: '',
    email: '',
    phone: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const userApi = new AxiosUserManagement()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await userApi.registerUser(formData)
      if (result) {
        router.push('/auth/login')
      }
    } catch (error) {
      console.error('Error en el registro:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col md:flex-row bg-white">
      {/* Left panel - Hero */}
      <AuthHeroPanel subtitle="Crea tu cuenta y gestiona tu flota en minutos" />

      {/* Right panel - Register form */}
      <div className="w-full md:w-[40%] bg-slate-50 flex flex-col justify-center items-center p-6 lg:p-12 relative overflow-y-auto">
        {/* Mobile brand */}
        <div className="md:hidden w-full mb-8 flex items-center justify-center gap-2">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
            <Truck className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Transportadora</h2>
        </div>

        <div className="w-full max-w-[420px]">
          {/* Glass card form */}
          <div className="glass-card p-8 rounded-2xl bg-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Crear Cuenta</h2>
              <p className="text-slate-500 text-sm">Completa tus datos para registrarte</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name fields - 2 columns */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="first_name" className="block text-xs font-medium text-slate-700 ml-1">
                    Nombre
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="w-[16px] h-[16px] text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                      id="first_name"
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      placeholder="Juan"
                      required
                      className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label htmlFor="last_name" className="block text-xs font-medium text-slate-700 ml-1">
                    Apellido
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="w-[16px] h-[16px] text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                      id="last_name"
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      placeholder="Pérez"
                      required
                      className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Identification */}
              <div className="space-y-1">
                <label htmlFor="identification" className="block text-xs font-medium text-slate-700 ml-1">
                  Identificación
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <CreditCard className="w-[18px] h-[18px] text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    id="identification"
                    type="text"
                    name="identification"
                    value={formData.identification}
                    onChange={handleInputChange}
                    placeholder="1234567890"
                    required
                    className="block w-full pl-11 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm"
                  />
                </div>
              </div>

              {/* Birthdate */}
              <div className="space-y-1">
                <label htmlFor="birthdate" className="block text-xs font-medium text-slate-700 ml-1">
                  Fecha de Nacimiento
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Calendar className="w-[18px] h-[18px] text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    id="birthdate"
                    type="date"
                    name="birthdate"
                    value={formData.birthdate}
                    onChange={handleInputChange}
                    required
                    className="block w-full pl-11 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label htmlFor="email" className="block text-xs font-medium text-slate-700 ml-1">
                  Email Corporativo
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="w-[18px] h-[18px] text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="nombre@empresa.com"
                    required
                    autoComplete="email"
                    className="block w-full pl-11 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label htmlFor="phone" className="block text-xs font-medium text-slate-700 ml-1">
                  Teléfono
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Phone className="w-[18px] h-[18px] text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="3001234567"
                    required
                    className="block w-full pl-11 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label htmlFor="password" className="block text-xs font-medium text-slate-700 ml-1">
                  Contraseña
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="w-[18px] h-[18px] text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                    className="block w-full pl-11 pr-11 py-2.5 border border-slate-200 rounded-xl leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="w-[18px] h-[18px] text-slate-400 hover:text-blue-500 transition-colors" />
                    ) : (
                      <Eye className="w-[18px] h-[18px] text-slate-400 hover:text-blue-500 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-500/30 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none mt-2"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  'Registrarse'
                )}
              </button>
            </form>
          </div>

          {/* Login link */}
          <p className="mt-6 text-center text-sm text-slate-600">
            ¿Ya tienes cuenta?{' '}
            <Link
              href="/auth/login"
              className="font-bold text-cyan-600 hover:text-cyan-700 hover:underline transition-colors decoration-2 underline-offset-4"
            >
              Inicia sesión
            </Link>
          </p>

          {/* Copyright */}
          <div className="mt-6 text-center">
            <p className="text-[10px] text-slate-400">© 2026 Transportadora SaaS. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
