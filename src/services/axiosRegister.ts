import type {
  RegisterUserDto,
  RegisterResponse,
  LoginUserDto,
  LoginResponse,
  ErrorResponse
} from '@/types/userTypes'
import { api } from './api'
import { toast } from 'react-toastify'

export class AxiosUserManagement {
  api

  constructor() {
    this.api = api
  }

  // Método para registrar un nuevo usuario
  async registerUser(data: RegisterUserDto): Promise<RegisterResponse | null> {
    try {
      console.log('Enviando datos de registro:', data)
      
      const response = await this.api.post('/users/register', data)
      
      console.log('Respuesta del servidor:', response.data)
      
      // Mostrar mensaje de éxito
      toast.success('Usuario registrado exitosamente')
      
      return response.data
    } catch (error: any) {
      console.error('Error al registrar usuario:', error)
      
      // Manejar diferentes tipos de errores
      if (error.response) {
        console.error('Status:', error.response.status)
        console.error('Data:', error.response.data)
        console.error('Headers:', error.response.headers)
        
        const errorData: ErrorResponse = error.response.data
        
        // Error de validación (400)
        if (error.response.status === 400) {
          if (errorData.errors && errorData.errors.length > 0) {
            // Mostrar errores de validación específicos
            errorData.errors.forEach(err => {
              const constraintMessage = Object.values(err.constraints)[0]
              toast.error(`${err.property}: ${constraintMessage}`)
            })
          } else {
            toast.error(errorData.message || 'Error de validación')
          }
        }
        // Error de servidor (500)
        else if (error.response.status === 500) {
          toast.error('Error interno del servidor')
        }
        // Otros errores
        else {
          toast.error(errorData.message || errorData.error || 'Error al registrar usuario')
        }
      } else if (error.request) {
        // Error de red
        console.error('Error de red:', error.request)
        toast.error('Error de conexión. Verifica tu conexión a internet')
      } else {
        // Error inesperado
        console.error('Error inesperado:', error.message)
        toast.error('Error inesperado al registrar usuario')
      }
      
      return null
    }
  }

  // Método para hacer login
  async loginUser(data: LoginUserDto): Promise<LoginResponse | null> {
    try {
      console.log('Enviando datos de login:', data)
      
      const response = await this.api.post('/auth/login', data)
      
      console.log('Respuesta del servidor:', response.data)
      
      // Guardar token en localStorage
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
      
      // Mostrar mensaje de éxito
      toast.success('Inicio de sesión exitoso')
      
      return response.data
    } catch (error: any) {
      console.error('Error al hacer login:', error)
      
      // Manejar diferentes tipos de errores
      if (error.response) {
        const errorData: ErrorResponse = error.response.data
        
        // Error de credenciales (401)
        if (error.response.status === 401) {
          toast.error(errorData.error || 'Credenciales incorrectas')
        }
        // Error de validación (400)
        else if (error.response.status === 400) {
          if (errorData.errors && errorData.errors.length > 0) {
            errorData.errors.forEach(err => {
              const constraintMessage = Object.values(err.constraints)[0]
              toast.error(`${err.property}: ${constraintMessage}`)
            })
          } else {
            toast.error(errorData.message || 'Error de validación')
          }
        }
        // Error de servidor (500)
        else if (error.response.status === 500) {
          toast.error('Error interno del servidor')
        }
        // Otros errores
        else {
          toast.error(errorData.message || errorData.error || 'Error al iniciar sesión')
        }
      } else if (error.request) {
        toast.error('Error de conexión. Verifica tu conexión a internet')
      } else {
        toast.error('Error inesperado al iniciar sesión')
      }
      
      return null
    }
  }

}
