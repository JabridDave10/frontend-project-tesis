import { api } from './api';
import { Permission, Role, UserPermissionsResponse } from '@/types/permissionTypes';

export class PermissionsService {
  /**
   * Obtiene los permisos del usuario actual
   */
  async getUserPermissions(): Promise<Permission[]> {
    try {
      const response = await api.get<UserPermissionsResponse>('/auth/permissions');
      return response.data.permissions || [];
    } catch (error) {
      console.error('Error al obtener permisos del usuario:', error);
      return [];
    }
  }

  /**
   * Obtiene todos los permisos disponibles
   */
  async getAllPermissions(): Promise<Permission[]> {
    try {
      const response = await api.get<Permission[]>('/permissions');
      return response.data || [];
    } catch (error) {
      console.error('Error al obtener todos los permisos:', error);
      return [];
    }
  }

  /**
   * Obtiene todos los roles
   */
  async getAllRoles(): Promise<Role[]> {
    try {
      const response = await api.get<Role[]>('/roles');
      return response.data || [];
    } catch (error) {
      console.error('Error al obtener roles:', error);
      return [];
    }
  }

  /**
   * Obtiene los permisos de un rol específico
   */
  async getRolePermissions(roleId: number): Promise<Permission[]> {
    try {
      const response = await api.get<Permission[]>(`/roles/${roleId}/permissions`);
      return response.data || [];
    } catch (error) {
      console.error('Error al obtener permisos del rol:', error);
      return [];
    }
  }
}

