import { api } from './api'
import type {
  CreateClientDto,
  ClientResponse,
  ClientsListResponse,
  Client
} from '@/types/clientTypes'
import { ErrorResponse } from '@/types/userTypes'
import { toast } from 'react-toastify'

export class AxiosClients {
  api

  constructor() {
    this.api = api
  }

  /**
   * Crear un nuevo cliente
   */
  async createClient(data: CreateClientDto): Promise<Client | null> {
    try {
      console.log('Enviando datos de creación de cliente:', data)

      const response = await this.api.post<ClientResponse>('/clients/create', data)

      console.log('Respuesta del servidor:', response.data)

      toast.success(response.data.message || 'Cliente creado exitosamente')

      return response.data.data
    } catch (error: any) {
      console.error('Error al crear cliente:', error)

      // Manejar diferentes tipos de errores
      if (error.response) {
        const errorData: ErrorResponse = error.response.data

        // Error de validación (400)
        if (error.response.status === 400) {
          if (Array.isArray(errorData)) {
            // Si es un array de errores de validación de class-validator
            errorData.forEach((err: any) => {
              const constraintMessage = Object.values(err.constraints || {})[0]
              toast.error(`${err.property}: ${constraintMessage}`)
            })
          } else if (errorData.errors && errorData.errors.length > 0) {
            errorData.errors.forEach((err: any) => {
              const constraintMessage = Object.values(err.constraints || {})[0]
              toast.error(`${err.property}: ${constraintMessage}`)
            })
          } else {
            toast.error(errorData.message || 'Error de validación')
          }
        }
        // Error de servidor (500)
        else if (error.response.status === 500) {
          toast.error(errorData.message || 'Error interno del servidor')
        }
        // Otros errores
        else {
          toast.error(errorData.message || errorData.error || 'Error al crear cliente')
        }
      } else if (error.request) {
        toast.error('Error de conexión. Verifica tu conexión a internet')
      } else {
        toast.error('Error inesperado al crear cliente')
      }

      return null
    }
  }

  /**
   * Obtener todos los clientes
   */
  async getAllClients(): Promise<Client[]> {
    try {
      const response = await this.api.get<ClientsListResponse>('/clients/get-all')

      console.log('Clientes obtenidos:', response.data)

      return response.data.data || []
    } catch (error: any) {
      console.error('Error al obtener clientes:', error)

      if (error.response) {
        const errorData: ErrorResponse = error.response.data

        if (error.response.status === 500) {
          toast.error(errorData.message || 'Error interno del servidor')
        } else {
          toast.error(errorData.message || 'Error al obtener clientes')
        }
      } else if (error.request) {
        toast.error('Error de conexión. Verifica tu conexión a internet')
      } else {
        toast.error('Error inesperado al obtener clientes')
      }

      return []
    }
  }
}
