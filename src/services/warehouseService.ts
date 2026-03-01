import { api } from './api';
import { toast } from 'react-toastify';
import {
  Warehouse,
  CreateWarehouseDto,
  UpdateWarehouseDto,
  ApiResponse,
} from '@/types/productTypes';

export class WarehouseService {
  private api = api;

  async createWarehouse(data: CreateWarehouseDto): Promise<Warehouse | null> {
    try {
      const response = await this.api.post<ApiResponse<Warehouse>>(
        '/warehouse',
        data
      );
      toast.success(response.data.message || 'Bodega creada exitosamente');
      return response.data.data;
    } catch (error: any) {
      console.error('Error al crear bodega:', error);

      if (error.response) {
        const errorData = error.response.data;
        const status = error.response.status;

        if (status === 400) {
          toast.error(errorData.message || 'Datos invalidos');
        } else if (status === 409) {
          toast.error(
            errorData.message || 'Ya existe una bodega con ese nombre'
          );
        } else {
          toast.error('Error al crear la bodega');
        }
      } else {
        toast.error('Error de conexion con el servidor');
      }

      return null;
    }
  }

  async getAllWarehouses(companyId?: number): Promise<Warehouse[]> {
    try {
      const url = companyId
        ? `/warehouse?companyId=${companyId}`
        : '/warehouse';

      const response = await this.api.get<Warehouse[]>(url);
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener bodegas:', error);
      toast.error('Error al cargar la lista de bodegas');
      return [];
    }
  }

  async getWarehouseById(id: number): Promise<Warehouse | null> {
    try {
      const response = await this.api.get<Warehouse>(`/warehouse/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener bodega:', error);

      if (error.response?.status === 404) {
        toast.error('Bodega no encontrada');
      } else {
        toast.error('Error al cargar la bodega');
      }

      return null;
    }
  }

  async updateWarehouse(
    id: number,
    data: UpdateWarehouseDto
  ): Promise<Warehouse | null> {
    try {
      const response = await this.api.patch<ApiResponse<Warehouse>>(
        `/warehouse/${id}`,
        data
      );
      toast.success(
        response.data.message || 'Bodega actualizada exitosamente'
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Error al actualizar bodega:', error);

      if (error.response) {
        const errorData = error.response.data;
        const status = error.response.status;

        if (status === 400) {
          toast.error(errorData.message || 'Datos invalidos');
        } else if (status === 404) {
          toast.error('Bodega no encontrada');
        } else {
          toast.error('Error al actualizar la bodega');
        }
      } else {
        toast.error('Error de conexion con el servidor');
      }

      return null;
    }
  }

  async deleteWarehouse(id: number): Promise<boolean> {
    try {
      await this.api.delete(`/warehouse/${id}`);
      toast.success('Bodega eliminada exitosamente');
      return true;
    } catch (error: any) {
      console.error('Error al eliminar bodega:', error);

      if (error.response) {
        const errorData = error.response.data;
        const status = error.response.status;

        if (status === 400) {
          toast.error(
            errorData.message ||
              'No se puede eliminar (tiene stock activo)'
          );
        } else if (status === 404) {
          toast.error('Bodega no encontrada');
        } else {
          toast.error('Error al eliminar la bodega');
        }
      } else {
        toast.error('Error de conexion con el servidor');
      }

      return false;
    }
  }
}

export const warehouseService = new WarehouseService();
