import type {
  Vehicle,
  CreateVehicleDto,
  UpdateVehicleDto,
  VehicleResponse
} from '@/types/vehicleTypes'
import { api } from './api'
import { toast } from 'react-toastify'

export class VehiclesService {
  api

  constructor() {
    this.api = api
  }

  // Crear un nuevo vehículo
  async createVehicle(data: CreateVehicleDto): Promise<Vehicle | null> {
    try {
      console.log('Enviando datos de vehículo:', data)

      const response = await this.api.post('/vehicles', data)

      console.log('Respuesta del servidor:', response.data)

      toast.success('Vehículo creado exitosamente')

      return response.data.data
    } catch (error: any) {
      console.error('Error al crear vehículo:', error)

      if (error.response) {
        const errorData = error.response.data

        if (error.response.status === 400) {
          toast.error(errorData.message || 'Error de validación')
        } else if (error.response.status === 500) {
          toast.error('Error interno del servidor')
        } else {
          toast.error(errorData.message || 'Error al crear vehículo')
        }
      } else if (error.request) {
        toast.error('Error de conexión. Verifica tu conexión a internet')
      } else {
        toast.error('Error inesperado al crear vehículo')
      }

      return null
    }
  }

  // Obtener todos los vehículos
  async getAllVehicles(): Promise<Vehicle[]> {
    try {
      const response = await this.api.get('/vehicles')
      return response.data
    } catch (error: any) {
      console.error('Error al obtener vehículos:', error)
      toast.error('Error al cargar los vehículos')
      return []
    }
  }

  // Obtener vehículos disponibles
  async getAvailableVehicles(): Promise<Vehicle[]> {
    try {
      const response = await this.api.get('/vehicles/available')
      return response.data
    } catch (error: any) {
      console.error('Error al obtener vehículos disponibles:', error)
      toast.error('Error al cargar vehículos disponibles')
      return []
    }
  }

  // Obtener vehículos de un conductor
  async getVehiclesByDriver(driverId: number): Promise<Vehicle[]> {
    try {
      const response = await this.api.get(`/vehicles/by-driver/${driverId}`)
      return response.data
    } catch (error: any) {
      console.error('Error al obtener vehículos del conductor:', error)
      toast.error('Error al cargar vehículos del conductor')
      return []
    }
  }

  // Obtener un vehículo por ID
  async getVehicleById(id: number): Promise<Vehicle | null> {
    try {
      const response = await this.api.get(`/vehicles/${id}`)
      return response.data
    } catch (error: any) {
      console.error('Error al obtener vehículo:', error)

      if (error.response?.status === 404) {
        toast.error('Vehículo no encontrado')
      } else {
        toast.error('Error al cargar el vehículo')
      }

      return null
    }
  }

  // Actualizar un vehículo
  async updateVehicle(id: number, data: UpdateVehicleDto): Promise<Vehicle | null> {
    try {
      const response = await this.api.patch(`/vehicles/${id}`, data)
      toast.success('Vehículo actualizado exitosamente')
      return response.data.data
    } catch (error: any) {
      console.error('Error al actualizar vehículo:', error)

      if (error.response?.status === 404) {
        toast.error('Vehículo no encontrado')
      } else {
        toast.error('Error al actualizar vehículo')
      }

      return null
    }
  }

  // Eliminar un vehículo
  async deleteVehicle(id: number): Promise<boolean> {
    try {
      await this.api.delete(`/vehicles/${id}`)
      toast.success('Vehículo eliminado exitosamente')
      return true
    } catch (error: any) {
      console.error('Error al eliminar vehículo:', error)

      if (error.response?.status === 404) {
        toast.error('Vehículo no encontrado')
      } else {
        toast.error('Error al eliminar vehículo')
      }

      return false
    }
  }
}
