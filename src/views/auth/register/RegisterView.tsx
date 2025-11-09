'use client'

import { useState } from 'react'
import { AxiosUserManagement } from '@/services/axiosRegister'
import { RegisterUserDto } from '@/types/userTypes'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { InputWithIcon } from '@/components/ui/input-with-icon'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Mail, Lock, Eye, EyeOff, Calendar, Phone, CreditCard } from 'lucide-react'

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
        // Redirigir al login después del registro exitoso
        router.push('/auth/login')
      }
    } catch (error) {
      console.error('Error en el registro:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo - Gradiente azul */}
      <div className="flex-1 bg-gradient-to-br from-blue-500 to-blue-800 relative overflow-hidden">
        {/* Patrones decorativos */}
        <div className="absolute bottom-0 left-0 w-64 h-64 opacity-10">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <circle cx="50" cy="50" r="2" fill="white" />
            <circle cx="100" cy="30" r="1.5" fill="white" />
            <circle cx="150" cy="60" r="1" fill="white" />
            <circle cx="80" cy="100" r="2.5" fill="white" />
            <circle cx="120" cy="120" r="1" fill="white" />
            <circle cx="40" cy="140" r="1.5" fill="white" />
            <circle cx="160" cy="140" r="2" fill="white" />
            <circle cx="70" cy="160" r="1" fill="white" />
            <circle cx="130" cy="180" r="1.5" fill="white" />
          </svg>
        </div>
        
        {/* Contenido del panel izquierdo */}
        <div className="flex flex-col items-center justify-center h-full text-white p-8">
          <h1 className="text-5xl font-bold mb-4 text-center">
            Transportadora
          </h1>
          <p className="text-xl mb-8 text-center opacity-90">
            Únete a nuestra plataforma
          </p>
          <Button 
            type="button" 
            variant="outline"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 px-8"
          >
            Link
          </Button>
        </div>
      </div>

      {/* Panel derecho - Formulario de registro */}
      <div className="w-full max-w-md bg-background flex flex-col justify-center p-8 overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold">Crear Cuenta</CardTitle>
            <CardDescription>Completa tus datos para registrarte</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo First Name */}
              <div className="space-y-2">
                <InputWithIcon
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  placeholder="Nombre"
                  leftIcon={<User className="h-5 w-5" />}
                  required
                />
              </div>

              {/* Campo Last Name */}
              <div className="space-y-2">
                <InputWithIcon
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  placeholder="Apellido"
                  leftIcon={<User className="h-5 w-5" />}
                  required
                />
              </div>

              {/* Campo Identification */}
              <div className="space-y-2">
                <InputWithIcon
                  type="text"
                  name="identification"
                  value={formData.identification}
                  onChange={handleInputChange}
                  placeholder="Identificación"
                  leftIcon={<CreditCard className="h-5 w-5" />}
                  required
                />
              </div>

              {/* Campo Birthdate */}
              <div className="space-y-2">
                <InputWithIcon
                  type="date"
                  name="birthdate"
                  value={formData.birthdate}
                  onChange={handleInputChange}
                  placeholder="Fecha de nacimiento"
                  leftIcon={<Calendar className="h-5 w-5" />}
                  required
                />
              </div>

              {/* Campo Email */}
              <div className="space-y-2">
                <InputWithIcon
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  leftIcon={<Mail className="h-5 w-5" />}
                  required
                />
              </div>

              {/* Campo Phone */}
              <div className="space-y-2">
                <InputWithIcon
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Teléfono"
                  leftIcon={<Phone className="h-5 w-5" />}
                  required
                />
              </div>

              {/* Campo Password */}
              <div className="space-y-2">
                <InputWithIcon
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Contraseña"
                  leftIcon={<Lock className="h-5 w-5" />}
                  rightIcon={showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  onRightIconClick={() => setShowPassword(!showPassword)}
                  required
                />
              </div>

              {/* Botón Register */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                {isLoading ? 'Creando cuenta...' : 'Registrarse'}
              </Button>
            </form>

            {/* Link para ir al login */}
            <div className="mt-6 text-center">
              <div className="text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{' '}
                <a 
                  href="/auth/login" 
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Inicia sesión
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
