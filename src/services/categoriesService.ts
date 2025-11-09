import { api } from './api';
import { toast } from 'react-toastify';
import {
  ProductCategory,
  CreateProductCategoryDto,
  UpdateProductCategoryDto,
  ApiResponse,
} from '@/types/productTypes';

export class CategoriesService {
  private api = api;

  /**
   * Crear una nueva categoría
   */
  async createCategory(
    data: CreateProductCategoryDto
  ): Promise<ProductCategory | null> {
    try {
      const response = await this.api.post<ApiResponse<ProductCategory>>(
        '/product-categories',
        data
      );
      toast.success(response.data.message || 'Categoría creada exitosamente');
      return response.data.data;
    } catch (error: any) {
      console.error('Error al crear categoría:', error);

      if (error.response) {
        const errorData = error.response.data;
        const status = error.response.status;

        if (status === 400) {
          toast.error(errorData.message || 'Datos inválidos');
        } else if (status === 409) {
          toast.error(
            errorData.message || 'Ya existe una categoría con ese nombre'
          );
        } else {
          toast.error('Error al crear la categoría');
        }
      } else {
        toast.error('Error de conexión con el servidor');
      }

      return null;
    }
  }

  /**
   * Obtener todas las categorías (opcionalmente filtrado por compañía)
   */
  async getAllCategories(companyId?: number): Promise<ProductCategory[]> {
    try {
      const url = companyId
        ? `/product-categories?companyId=${companyId}`
        : '/product-categories';

      const response = await this.api.get<ProductCategory[]>(url);
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener categorías:', error);
      toast.error('Error al cargar la lista de categorías');
      return [];
    }
  }

  /**
   * Obtener una categoría por ID
   */
  async getCategoryById(id: number): Promise<ProductCategory | null> {
    try {
      const response = await this.api.get<ProductCategory>(
        `/product-categories/${id}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener categoría:', error);

      if (error.response?.status === 404) {
        toast.error('Categoría no encontrada');
      } else {
        toast.error('Error al cargar la categoría');
      }

      return null;
    }
  }

  /**
   * Actualizar una categoría
   */
  async updateCategory(
    id: number,
    data: UpdateProductCategoryDto
  ): Promise<ProductCategory | null> {
    try {
      const response = await this.api.patch<ApiResponse<ProductCategory>>(
        `/product-categories/${id}`,
        data
      );
      toast.success(
        response.data.message || 'Categoría actualizada exitosamente'
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Error al actualizar categoría:', error);

      if (error.response) {
        const errorData = error.response.data;
        const status = error.response.status;

        if (status === 400) {
          toast.error(errorData.message || 'Datos inválidos');
        } else if (status === 404) {
          toast.error('Categoría no encontrada');
        } else if (status === 409) {
          toast.error('Ya existe una categoría con ese nombre');
        } else {
          toast.error('Error al actualizar la categoría');
        }
      } else {
        toast.error('Error de conexión con el servidor');
      }

      return null;
    }
  }

  /**
   * Eliminar una categoría (soft delete)
   */
  async deleteCategory(id: number): Promise<boolean> {
    try {
      await this.api.delete(`/product-categories/${id}`);
      toast.success('Categoría eliminada exitosamente');
      return true;
    } catch (error: any) {
      console.error('Error al eliminar categoría:', error);

      if (error.response) {
        const errorData = error.response.data;
        const status = error.response.status;

        if (status === 400) {
          toast.error(
            errorData.message ||
              'No se puede eliminar (tiene productos asociados)'
          );
        } else if (status === 404) {
          toast.error('Categoría no encontrada');
        } else {
          toast.error('Error al eliminar la categoría');
        }
      } else {
        toast.error('Error de conexión con el servidor');
      }

      return false;
    }
  }
}

export const categoriesService = new CategoriesService();
