'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Truck, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'
import axios from 'axios'

export default function ConductorLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // 1. Login
      const loginRes = await axios.post(`${apiUrl}/auth/login`, { email, password }, {
        withCredentials: true,
      })

      const { user, access_token } = loginRes.data

      // Store token for WebSocket auth
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('user', JSON.stringify(user))

      // 2. Validate driver profile
      const driverRes = await axios.get(`${apiUrl}/gps-tracking/driver/me`, {
        headers: { Authorization: `Bearer ${access_token}` },
        withCredentials: true,
      })

      const { driver, activeRoute, pendingRoutes } = driverRes.data
      localStorage.setItem('driver', JSON.stringify(driver))
      if (activeRoute) {
        localStorage.setItem('activeRoute', JSON.stringify(activeRoute))
      }
      if (pendingRoutes) {
        localStorage.setItem('pendingRoutes', JSON.stringify(pendingRoutes))
      }

      toast.success(`Bienvenido, ${driver.first_name}`)
      router.push('/conductor/tracking')
    } catch (err: unknown) {
      console.error('Login error:', err)
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError('Credenciales invalidas')
        } else if (err.response?.status === 404) {
          setError('Esta cuenta no tiene perfil de conductor')
        } else {
          setError('Error al iniciar sesion. Intenta de nuevo.')
        }
      } else {
        setError('Error al iniciar sesion. Intenta de nuevo.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/20">
            <Truck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">GPS Tracking</h1>
          <p className="text-blue-300/70 text-sm mt-1">Acceso para conductores</p>
        </div>

        {/* Login form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-xl">
            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Correo electronico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
              />
            </div>

            {/* Password */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Contrasena
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contrasena"
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300/60 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-3 rounded-xl border border-red-400/20">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-cyan-400 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Iniciar Sesion'
              )}
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-blue-300/40 mt-6">
          Solo para conductores registrados
        </p>
      </div>
    </div>
  )
}
