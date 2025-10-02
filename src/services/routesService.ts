import type {
  Route,
  CreateRouteDto,
  UpdateRouteDto,
  RouteResponse
} from '@/types/routeTypes'
import { api } from './api'
import { toast } from 'react-toastify'

export class RoutesService {
  api

  constructor() {
    this.api = api
  }

  // Crear una nueva ruta
  async createRoute(data: CreateRouteDto): Promise<Route | null> {
    try {
      console.log('Enviando datos de ruta:', data)

      const response = await this.api.post('/routes', data)

      console.log('Respuesta del servidor:', response.data)

      toast.success('Ruta creada exitosamente')

      return response.data.data
    } catch (error: any) {
      console.error('Error al crear ruta:', error)

      if (error.response) {
        const errorData = error.response.data

        if (error.response.status === 400) {
          toast.error(errorData.message || 'Error de validación')
        } else if (error.response.status === 500) {
          toast.error('Error interno del servidor')
        } else {
          toast.error(errorData.message || 'Error al crear ruta')
        }
      } else if (error.request) {
        toast.error('Error de conexión. Verifica tu conexión a internet')
      } else {
        toast.error('Error inesperado al crear ruta')
      }

      return null
    }
  }

  // Obtener todas las rutas
  async getAllRoutes(): Promise<Route[]> {
    try {
      const response = await this.api.get('/routes')
      return response.data
    } catch (error: any) {
      console.error('Error al obtener rutas:', error)
      toast.error('Error al cargar las rutas')
      return []
    }
  }

  // Obtener rutas por estado
  async getRoutesByStatus(status: string): Promise<Route[]> {
    try {
      const response = await this.api.get(`/routes/by-status/${status}`)
      return response.data
    } catch (error: any) {
      console.error('Error al obtener rutas por estado:', error)
      toast.error('Error al cargar rutas por estado')
      return []
    }
  }

  // Obtener una ruta por ID
  async getRouteById(id: number): Promise<Route | null> {
    try {
      const response = await this.api.get(`/routes/${id}`)
      return response.data
    } catch (error: any) {
      console.error('Error al obtener ruta:', error)

      if (error.response?.status === 404) {
        toast.error('Ruta no encontrada')
      } else {
        toast.error('Error al cargar la ruta')
      }

      return null
    }
  }

  // Actualizar una ruta
  async updateRoute(id: number, data: UpdateRouteDto): Promise<Route | null> {
    try {
      const response = await this.api.patch(`/routes/${id}`, data)
      toast.success('Ruta actualizada exitosamente')
      return response.data.data
    } catch (error: any) {
      console.error('Error al actualizar ruta:', error)

      if (error.response?.status === 404) {
        toast.error('Ruta no encontrada')
      } else {
        toast.error('Error al actualizar ruta')
      }

      return null
    }
  }

  // Actualizar estado de una ruta
  async updateRouteStatus(id: number, status: string, completed_at?: string): Promise<Route | null> {
    try {
      const response = await this.api.patch(`/routes/${id}/status`, {
        status,
        completed_at
      })
      toast.success('Estado actualizado exitosamente')
      return response.data.data
    } catch (error: any) {
      console.error('Error al actualizar estado:', error)
      toast.error('Error al actualizar estado')
      return null
    }
  }

  // Eliminar una ruta
  async deleteRoute(id: number): Promise<boolean> {
    try {
      await this.api.delete(`/routes/${id}`)
      toast.success('Ruta eliminada exitosamente')
      return true
    } catch (error: any) {
      console.error('Error al eliminar ruta:', error)

      if (error.response?.status === 404) {
        toast.error('Ruta no encontrada')
      } else {
        toast.error('Error al eliminar ruta')
      }

      return false
    }
  }
}
