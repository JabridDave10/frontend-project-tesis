import { api } from './api'
import { Cargo, CreateCargoDto } from '@/types/cargoTypes'
import { toast } from 'react-toastify'

export class CargoService {
  api

  constructor() {
    this.api = api
  }

  // Crear una nueva carga
  async createCargo(data: CreateCargoDto): Promise<Cargo | null> {
    try {
      console.log('Enviando datos de carga:', data)

      const response = await this.api.post('/cargos', data)

      console.log('Respuesta del servidor:', response.data)

      toast.success('Carga creada exitosamente')

      return response.data.data
    } catch (error: any) {
      console.error('Error al crear carga:', error)

      if (error.response) {
        const errorData = error.response.data

        if (error.response.status === 400) {
          toast.error(errorData.message || 'Error de validación')
        } else if (error.response.status === 500) {
          toast.error('Error interno del servidor')
        } else {
          toast.error(errorData.message || 'Error al crear carga')
        }
      } else if (error.request) {
        toast.error('Error de conexión. Verifica tu conexión a internet')
      } else {
        toast.error('Error inesperado al crear carga')
      }

      return null
    }
  }

  // Obtener todas las cargas
  async getAllCargos(): Promise<Cargo[]> {
    try {
      const response = await this.api.get('/cargos')
      return response.data || []
    } catch (error: any) {
      console.error('Error al obtener cargas:', error)
      toast.error('Error al cargar las cargas')
      return []
    }
  }

  // Obtener cargas pendientes
  async getPendingCargos(): Promise<Cargo[]> {
    try {
      const response = await this.api.get('/cargos?status=pendiente')
      return response.data || []
    } catch (error: any) {
      console.error('Error al obtener cargas pendientes:', error)
      return []
    }
  }

  // Obtener una carga por ID
  async getCargoById(id: number): Promise<Cargo | null> {
    try {
      const response = await this.api.get(`/cargos/${id}`)
      return response.data
    } catch (error: any) {
      console.error('Error al obtener carga:', error)

      if (error.response?.status === 404) {
        toast.error('Carga no encontrada')
      } else {
        toast.error('Error al cargar la carga')
      }

      return null
    }
  }

  // Actualizar una carga
  async updateCargo(id: number, data: Partial<CreateCargoDto>): Promise<Cargo | null> {
    try {
      const response = await this.api.patch(`/cargos/${id}`, data)
      toast.success('Carga actualizada exitosamente')
      return response.data.data
    } catch (error: any) {
      console.error('Error al actualizar carga:', error)

      if (error.response?.status === 404) {
        toast.error('Carga no encontrada')
      } else {
        toast.error('Error al actualizar carga')
      }

      return null
    }
  }

  // Eliminar una carga
  async deleteCargo(id: number): Promise<boolean> {
    try {
      await this.api.delete(`/cargos/${id}`)
      toast.success('Carga eliminada exitosamente')
      return true
    } catch (error: any) {
      console.error('Error al eliminar carga:', error)

      if (error.response?.status === 404) {
        toast.error('Carga no encontrada')
      } else {
        toast.error('Error al eliminar carga')
      }

      return false
    }
  }
}

