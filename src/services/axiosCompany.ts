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
      
      const response = await this.api.post('/company/create', data)
      
      console.log('Respuesta del servidor:', response.data)
      
      // Mostrar mensaje de éxito
      toast.success('Empresa creada exitosamente')
      
      return response.data
    } catch (error: any) {
      console.error('Error al crear empresa:', error)
      
      // Manejar diferentes tipos de errores
      if (error.response) {
        const errorData: ErrorResponse = error.response.data
        
        // Error de autenticación (401)
        if (error.response.status === 401) {
          toast.error('No autorizado para realizar esta acción')
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
        toast.error('Error de conexión. Verifica tu conexión a internet')
      } else {
        toast.error('Error inesperado al crear empresa')
      }
      
      return null
    }
  }
}