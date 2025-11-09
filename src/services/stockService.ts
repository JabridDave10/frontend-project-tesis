import { api } from './api';
import { toast } from 'react-toastify';
import {
  Stock,
  StockMovement,
  CreateStockMovementDto,
  ReserveStockDto,
  ApiResponse,
  StockAvailabilityResponse,
} from '@/types/productTypes';

export class StockService {
  private api = api;

  /**
   * Obtener stock de un producto en todas las bodegas
   */
  async getStockByProduct(productId: number): Promise<Stock[]> {
    try {
      const response = await this.api.get<Stock[]>(
        `/stock/product/${productId}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener stock del producto:', error);
      toast.error('Error al cargar el stock del producto');
      return [];
    }
  }

  /**
   * Obtener todo el stock de una bodega
   */
  async getStockByWarehouse(warehouseId: number): Promise<Stock[]> {
    try {
      const response = await this.api.get<Stock[]>(
        `/stock/warehouse/${warehouseId}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener stock de la bodega:', error);
      toast.error('Error al cargar el inventario de la bodega');
      return [];
    }
  }

  /**
   * Obtener stock de un producto en una bodega específica
   */
  async getStock(
    productId: number,
    warehouseId: number
  ): Promise<Stock | null> {
    try {
      const response = await this.api.get<Stock>(
        `/stock/product/${productId}/warehouse/${warehouseId}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener stock:', error);

      if (error.response?.status === 404) {
        toast.error('No hay stock registrado para este producto en esta bodega');
      } else {
        toast.error('Error al cargar el stock');
      }

      return null;
    }
  }

  /**
   * Verificar disponibilidad de stock
   */
  async checkAvailability(
    productId: number,
    warehouseId: number,
    quantity: number
  ): Promise<StockAvailabilityResponse | null> {
    try {
      const response = await this.api.get<StockAvailabilityResponse>(
        `/stock/check-availability?productId=${productId}&warehouseId=${warehouseId}&quantity=${quantity}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error al verificar disponibilidad:', error);
      toast.error('Error al verificar disponibilidad de stock');
      return null;
    }
  }

  /**
   * Reservar stock para una ruta
   */
  async reserveStock(data: ReserveStockDto): Promise<Stock | null> {
    try {
      const response = await this.api.post<ApiResponse<Stock>>(
        '/stock/reserve',
        data
      );
      toast.success(response.data.message || 'Stock reservado exitosamente');
      return response.data.data;
    } catch (error: any) {
      console.error('Error al reservar stock:', error);

      if (error.response) {
        const errorData = error.response.data;
        const status = error.response.status;

        if (status === 400) {
          toast.error(errorData.message || 'Stock insuficiente');
        } else if (status === 404) {
          toast.error('Stock no encontrado');
        } else {
          toast.error('Error al reservar stock');
        }
      } else {
        toast.error('Error de conexión con el servidor');
      }

      return null;
    }
  }

  /**
   * Liberar stock reservado
   */
  async releaseReservedStock(
    productId: number,
    warehouseId: number,
    quantity: number,
    userId: number
  ): Promise<Stock | null> {
    try {
      const response = await this.api.post<ApiResponse<Stock>>(
        '/stock/release',
        {
          productId,
          warehouseId,
          quantity,
          userId,
        }
      );
      toast.success(response.data.message || 'Stock liberado exitosamente');
      return response.data.data;
    } catch (error: any) {
      console.error('Error al liberar stock:', error);

      if (error.response) {
        const errorData = error.response.data;
        const status = error.response.status;

        if (status === 400) {
          toast.error(errorData.message || 'Cantidad reservada insuficiente');
        } else {
          toast.error('Error al liberar stock');
        }
      } else {
        toast.error('Error de conexión con el servidor');
      }

      return null;
    }
  }

  /**
   * Registrar entrada de stock
   */
  async addStock(data: CreateStockMovementDto): Promise<Stock | null> {
    try {
      const response = await this.api.post<ApiResponse<Stock>>(
        '/stock/movements/entry',
        data
      );
      toast.success(
        response.data.message || 'Entrada de stock registrada exitosamente'
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Error al registrar entrada de stock:', error);

      if (error.response) {
        const errorData = error.response.data;
        const status = error.response.status;

        if (status === 400) {
          toast.error(errorData.message || 'Datos inválidos');
        } else {
          toast.error('Error al registrar entrada de stock');
        }
      } else {
        toast.error('Error de conexión con el servidor');
      }

      return null;
    }
  }

  /**
   * Registrar salida de stock
   */
  async removeStock(data: CreateStockMovementDto): Promise<Stock | null> {
    try {
      const response = await this.api.post<ApiResponse<Stock>>(
        '/stock/movements/exit',
        data
      );
      toast.success(
        response.data.message || 'Salida de stock registrada exitosamente'
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Error al registrar salida de stock:', error);

      if (error.response) {
        const errorData = error.response.data;
        const status = error.response.status;

        if (status === 400) {
          toast.error(errorData.message || 'Stock insuficiente');
        } else {
          toast.error('Error al registrar salida de stock');
        }
      } else {
        toast.error('Error de conexión con el servidor');
      }

      return null;
    }
  }

  /**
   * Obtener historial de movimientos de un producto
   */
  async getMovementHistory(
    productId: number,
    limit: number = 50
  ): Promise<StockMovement[]> {
    try {
      const response = await this.api.get<StockMovement[]>(
        `/stock/movements/product/${productId}?limit=${limit}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener historial de movimientos:', error);
      toast.error('Error al cargar el historial de movimientos');
      return [];
    }
  }
}

export const stockService = new StockService();
