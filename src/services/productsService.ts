import { api } from './api';
import { toast } from 'react-toastify';
import {
  Product,
  CreateProductDto,
  UpdateProductDto,
  ApiResponse,
} from '@/types/productTypes';

export class ProductsService {
  private api = api;

  /**
   * Crear un nuevo producto
   */
  async createProduct(data: CreateProductDto): Promise<Product | null> {
    try {
      const response = await this.api.post<ApiResponse<Product>>(
        '/products',
        data
      );
      toast.success(response.data.message || 'Producto creado exitosamente');
      return response.data.data;
    } catch (error: any) {
      console.error('Error al crear producto:', error);

      if (error.response) {
        const errorData = error.response.data;
        const status = error.response.status;

        if (status === 400) {
          toast.error(errorData.message || 'Datos inválidos');
        } else if (status === 409) {
          toast.error(
            errorData.message || 'Ya existe un producto con ese SKU'
          );
        } else {
          toast.error('Error al crear el producto');
        }
      } else {
        toast.error('Error de conexión con el servidor');
      }

      return null;
    }
  }

  /**
   * Obtener todos los productos (opcionalmente filtrado por compañía)
   */
  async getAllProducts(companyId?: number): Promise<Product[]> {
    try {
      const url = companyId
        ? `/products?companyId=${companyId}`
        : '/products';

      const response = await this.api.get<Product[]>(url);
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener productos:', error);
      toast.error('Error al cargar la lista de productos');
      return [];
    }
  }

  /**
   * Obtener un producto por ID
   */
  async getProductById(id: number): Promise<Product | null> {
    try {
      const response = await this.api.get<Product>(`/products/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener producto:', error);

      if (error.response?.status === 404) {
        toast.error('Producto no encontrado');
      } else {
        toast.error('Error al cargar el producto');
      }

      return null;
    }
  }

  /**
   * Buscar producto por SKU
   */
  async getProductBySku(
    sku: string,
    companyId: number
  ): Promise<Product | null> {
    try {
      const response = await this.api.get<Product>(
        `/products/sku/${sku}?companyId=${companyId}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error al buscar producto por SKU:', error);

      if (error.response?.status === 404) {
        toast.error('Producto no encontrado');
      } else {
        toast.error('Error al buscar el producto');
      }

      return null;
    }
  }

  /**
   * Obtener productos por categoría
   */
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    try {
      const response = await this.api.get<Product[]>(
        `/products/category/${categoryId}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener productos por categoría:', error);
      toast.error('Error al cargar productos de la categoría');
      return [];
    }
  }

  /**
   * Actualizar un producto
   */
  async updateProduct(
    id: number,
    data: UpdateProductDto
  ): Promise<Product | null> {
    try {
      const response = await this.api.patch<ApiResponse<Product>>(
        `/products/${id}`,
        data
      );
      toast.success(
        response.data.message || 'Producto actualizado exitosamente'
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Error al actualizar producto:', error);

      if (error.response) {
        const errorData = error.response.data;
        const status = error.response.status;

        if (status === 400) {
          toast.error(errorData.message || 'Datos inválidos');
        } else if (status === 404) {
          toast.error('Producto no encontrado');
        } else if (status === 409) {
          toast.error('Ya existe un producto con ese SKU');
        } else {
          toast.error('Error al actualizar el producto');
        }
      } else {
        toast.error('Error de conexión con el servidor');
      }

      return null;
    }
  }

  /**
   * Eliminar un producto (soft delete)
   */
  async deleteProduct(id: number): Promise<boolean> {
    try {
      await this.api.delete(`/products/${id}`);
      toast.success('Producto eliminado exitosamente');
      return true;
    } catch (error: any) {
      console.error('Error al eliminar producto:', error);

      if (error.response?.status === 404) {
        toast.error('Producto no encontrado');
      } else {
        toast.error('Error al eliminar el producto');
      }

      return false;
    }
  }

  /**
   * Subir foto del producto
   */
  async uploadPhoto(id: number, file: File): Promise<Product | null> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await this.api.post<ApiResponse<Product>>(
        `/products/${id}/upload-photo`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      toast.success(
        response.data.message || 'Foto subida exitosamente'
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Error al subir foto:', error);

      if (error.response) {
        const errorData = error.response.data;
        const status = error.response.status;

        if (status === 400) {
          toast.error(
            errorData.message || 'Archivo inválido (solo JPG, PNG)'
          );
        } else if (status === 404) {
          toast.error('Producto no encontrado');
        } else {
          toast.error('Error al subir la foto');
        }
      } else {
        toast.error('Error de conexión con el servidor');
      }

      return null;
    }
  }
}

export const productsService = new ProductsService();
