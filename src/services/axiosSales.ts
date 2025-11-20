import { api } from './api'
import type {
  CreateSaleDto,
  SaleResponse,
  Sale,
  SalesListResponse
} from '@/types/saleTypes'
import { ErrorResponse } from '@/types/userTypes'
import { toast } from 'react-toastify'

export class AxiosSales {
  api

  constructor() {
    this.api = api
  }

  /**
   * Crear una nueva venta
   */
  async createSale(data: CreateSaleDto): Promise<Sale | null> {
    try {
      console.log('Enviando datos de creación de venta:', data)

      const response = await this.api.post<SaleResponse>('/sales/create', data)

      console.log('Respuesta del servidor:', response.data)

      toast.success(response.data.message || 'Venta creada exitosamente')

      return response.data.data
    } catch (error: any) {
      console.error('Error al crear venta:', error)

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
          toast.error(errorData.message || errorData.error || 'Error al crear venta')
        }
      } else if (error.request) {
        toast.error('Error de conexión. Verifica tu conexión a internet')
      } else {
        toast.error('Error inesperado al crear venta')
      }

      return null
    }
  }

  /**
   * Obtener todas las ventas
   */
  async getAllSales(): Promise<Sale[]> {
    try {
      const response = await this.api.get<SalesListResponse>('/sales/get-all')

      console.log('Ventas obtenidas:', response.data)

      return response.data.data || []
    } catch (error: any) {
      console.error('Error al obtener ventas:', error)

      if (error.response) {
        const errorData: ErrorResponse = error.response.data

        if (error.response.status === 500) {
          toast.error(errorData.message || 'Error interno del servidor')
        } else {
          toast.error(errorData.message || 'Error al obtener ventas')
        }
      } else if (error.request) {
        toast.error('Error de conexión. Verifica tu conexión a internet')
      } else {
        toast.error('Error inesperado al obtener ventas')
      }

      return []
    }
  }
}
