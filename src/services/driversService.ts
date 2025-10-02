import type {
  Driver,
  CreateDriverDto,
  UpdateDriverDto,
  DriverResponse
} from '@/types/driverTypes'
import { api } from './api'
import { toast } from 'react-toastify'

export class DriversService {
  api

  constructor() {
    this.api = api
  }

  // Crear un nuevo conductor
  async createDriver(data: CreateDriverDto): Promise<Driver | null> {
    try {
      console.log('Enviando datos de conductor:', data)

      const response = await this.api.post('/drivers', data)

      console.log('Respuesta del servidor:', response.data)

      toast.success('Conductor creado exitosamente')

      return response.data.data
    } catch (error: any) {
      console.error('Error al crear conductor:', error)

      if (error.response) {
        const errorData = error.response.data

        if (error.response.status === 400) {
          toast.error(errorData.message || 'Error de validación')
        } else if (error.response.status === 500) {
          toast.error('Error interno del servidor')
        } else {
          toast.error(errorData.message || 'Error al crear conductor')
        }
      } else if (error.request) {
        toast.error('Error de conexión. Verifica tu conexión a internet')
      } else {
        toast.error('Error inesperado al crear conductor')
      }

      return null
    }
  }

  // Obtener todos los conductores
  async getAllDrivers(): Promise<Driver[]> {
    try {
      const response = await this.api.get('/drivers')
      return response.data
    } catch (error: any) {
      console.error('Error al obtener conductores:', error)
      toast.error('Error al cargar los conductores')
      return []
    }
  }

  // Obtener conductores disponibles
  async getAvailableDrivers(): Promise<Driver[]> {
    try {
      const response = await this.api.get('/drivers/available')
      return response.data
    } catch (error: any) {
      console.error('Error al obtener conductores disponibles:', error)
      toast.error('Error al cargar conductores disponibles')
      return []
    }
  }

  // Obtener un conductor por ID
  async getDriverById(id: number): Promise<Driver | null> {
    try {
      const response = await this.api.get(`/drivers/${id}`)
      return response.data
    } catch (error: any) {
      console.error('Error al obtener conductor:', error)

      if (error.response?.status === 404) {
        toast.error('Conductor no encontrado')
      } else {
        toast.error('Error al cargar el conductor')
      }

      return null
    }
  }

  // Actualizar un conductor
  async updateDriver(id: number, data: UpdateDriverDto): Promise<Driver | null> {
    try {
      const response = await this.api.patch(`/drivers/${id}`, data)
      toast.success('Conductor actualizado exitosamente')
      return response.data.data
    } catch (error: any) {
      console.error('Error al actualizar conductor:', error)

      if (error.response?.status === 404) {
        toast.error('Conductor no encontrado')
      } else {
        toast.error('Error al actualizar conductor')
      }

      return null
    }
  }

  // Eliminar un conductor
  async deleteDriver(id: number): Promise<boolean> {
    try {
      await this.api.delete(`/drivers/${id}`)
      toast.success('Conductor eliminado exitosamente')
      return true
    } catch (error: any) {
      console.error('Error al eliminar conductor:', error)

      if (error.response?.status === 404) {
        toast.error('Conductor no encontrado')
      } else {
        toast.error('Error al eliminar conductor')
      }

      return false
    }
  }
}
