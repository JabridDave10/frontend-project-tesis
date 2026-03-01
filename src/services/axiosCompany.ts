import { api } from './api'
import type {
  CreateCompanyDto,
  CompanyResponse
} from '@/types/companyTypes'
import { ErrorResponse } from '@/types/userTypes'
import { toast } from 'react-toastify'



export class AxiosCompany {
  api

  constructor() {
    this.api = api
  }

  async createCompany(data: CreateCompanyDto): Promise<CompanyResponse | null> {
    try {
      console.log('Enviando datos de creación de empresa:', data)
      console.log('Tipo de datos:', typeof data, 'Estructura:', JSON.stringify(data, null, 2))
      
      const response = await this.api.post('/company/create', data)
      
      console.log('Respuesta del servidor:', response.data)
      
      // Mostrar mensaje de éxito
      toast.success('Empresa creada exitosamente')
      
      return response.data
    } catch (error: any) {
      console.error('Error al crear empresa:', error)
      console.error('Error completo:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      })
      
      // Manejar diferentes tipos de errores
      if (error.response) {
        const errorData: ErrorResponse = error.response.data
        
        console.log('Datos del error recibidos:', errorData)
        console.log('Status del error:', error.response.status)
        
        // Error de autenticación (401)
        if (error.response.status === 401) {
          toast.error('No autorizado para realizar esta acción')
        }
        // Error de validación (400)
        else if (error.response.status === 400) {
          console.log('Error de validación detectado')
          console.log('errorData.errors:', errorData.errors)
          console.log('errorData.message:', errorData.message)
          
          // Si hay errores de validación detallados (class-validator)
          if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
            errorData.errors.forEach((err: any) => {
              console.log('Error de validación individual:', err)
              if (err.constraints) {
                const constraintMessage = Object.values(err.constraints)[0]
                toast.error(`${err.property}: ${constraintMessage}`)
              } else {
                toast.error(`${err.property}: ${err.message || 'Error de validación'}`)
              }
            })
          } 
          // Si hay un mensaje de error general
          else if (errorData.message) {
            console.log('Mostrando mensaje de error general:', errorData.message)
            toast.error(errorData.message)
          }
          // Si hay un campo 'error'
          else if (errorData.error) {
            console.log('Mostrando error:', errorData.error)
            toast.error(errorData.error)
          }
          // Si el errorData es un string
          else if (typeof errorData === 'string') {
            console.log('Error es un string:', errorData)
            toast.error(errorData)
          }
          // Fallback
          else {
            console.log('Error de validación sin formato reconocido:', errorData)
            toast.error('Error de validación. Revisa los datos ingresados.')
          }
        }
        // Error de conflicto (409) - Empresa ya existe
        else if (error.response.status === 409) {
          toast.error('La empresa ya existe')
        }
        // Error de servidor (500)
        else if (error.response.status === 500) {
          toast.error('Error interno del servidor')
        }
        // Otros errores
        else {
          toast.error(errorData.message || errorData.error || 'Error al crear empresa')
        }
      } else if (error.request) {
        console.error('Error de request (sin respuesta):', error.request)
        toast.error('Error de conexión. Verifica tu conexión a internet')
      } else {
        console.error('Error inesperado:', error)
        toast.error('Error inesperado al crear empresa')
      }
      
      return null
    }
  }
}