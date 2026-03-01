'use client'

import { useState } from 'react'
import { AxiosUserManagement } from '@/services/axiosRegister'
import { LoginUserDto } from '@/types/userTypes'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, Truck } from 'lucide-react'
import { AuthHeroPanel } from '@/components/auth/AuthHeroPanel'
import Link from 'next/link'

export const LoginView = () => {
  const [formData, setFormData] = useState<LoginUserDto>({
    email: '',
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
      const result = await userApi.loginUser(formData)
      if (result) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error en el login:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col md:flex-row bg-white">
      {/* Left panel - Hero */}
      <AuthHeroPanel />

      {/* Right panel - Login form */}
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
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Inicia sesión</h2>
              <p className="text-slate-500 text-sm">Bienvenido a tu panel de control logístico</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email field */}
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
                    className="block w-full pl-11 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm"
                  />
                </div>
              </div>

              {/* Password field */}
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
                    autoComplete="current-password"
                    className="block w-full pl-11 pr-11 py-3 border border-slate-200 rounded-xl leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm"
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

              {/* Remember me + Forgot password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-600 cursor-pointer select-none">
                    Recordarme
                  </label>
                </div>
                <a href="#" className="text-xs font-medium text-blue-600 hover:text-blue-500 transition-colors">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-500/30 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-8 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider">
                <span className="px-3 bg-white text-slate-400 font-medium">O continúa con</span>
              </div>
            </div>

            {/* Social login buttons */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex justify-center items-center py-2.5 px-4 border border-slate-200 rounded-xl shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 group"
              >
                <svg className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="text-slate-600">Google</span>
              </button>
              <button
                type="button"
                className="flex justify-center items-center py-2.5 px-4 border border-slate-200 rounded-xl shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 group"
              >
                <svg className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M1 1h10v10H1z" />
                  <path fill="#81bc06" d="M12 1h10v10H12z" />
                  <path fill="#05a6f0" d="M1 12h10v10H1z" />
                  <path fill="#ffba08" d="M12 12h10v10H12z" />
                </svg>
                <span className="text-slate-600">Microsoft</span>
              </button>
            </div>
          </div>

          {/* Register link */}
          <p className="mt-8 text-center text-sm text-slate-600">
            ¿No tienes cuenta?{' '}
            <Link
              href="/auth/register"
              className="font-bold text-cyan-600 hover:text-cyan-700 hover:underline transition-colors decoration-2 underline-offset-4"
            >
              Regístrate ahora
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
