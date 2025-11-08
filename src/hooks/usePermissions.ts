'use client'

import { useState, useEffect } from 'react';
import { Permission } from '@/types/permissionTypes';
import { PermissionsService } from '@/services/permissionsService';

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const permissionsService = new PermissionsService();

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        // Primero intentar obtener permisos del usuario desde el backend
        const userPermissions = await permissionsService.getUserPermissions();
        
        if (userPermissions.length > 0) {
          setPermissions(userPermissions);
        } else {
          // Si no hay permisos del backend, intentar obtenerlos del localStorage
          // (cuando el usuario hace login, los permisos deberían guardarse ahí)
          const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
          if (userStr) {
            const user = JSON.parse(userStr);
            if (user.role?.permissions) {
              setPermissions(user.role.permissions);
            }
          }
        }
      } catch (error) {
        console.error('Error al cargar permisos:', error);
        // Fallback: obtener permisos del localStorage
        const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.role?.permissions) {
            setPermissions(user.role.permissions);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadPermissions();
  }, []);

  /**
   * Verifica si el usuario tiene un permiso específico
   */
  const hasPermission = (permissionName: string): boolean => {
    if (!permissionName) return true; // Si no se especifica permiso, mostrar por defecto
    return permissions.some(permission => 
      permission.nombre.toLowerCase() === permissionName.toLowerCase()
    );
  };

  /**
   * Verifica si el usuario tiene alguno de los permisos especificados
   */
  const hasAnyPermission = (permissionNames: string[]): boolean => {
    if (!permissionNames || permissionNames.length === 0) return true;
    return permissionNames.some(name => hasPermission(name));
  };

  /**
   * Verifica si el usuario tiene todos los permisos especificados
   */
  const hasAllPermissions = (permissionNames: string[]): boolean => {
    if (!permissionNames || permissionNames.length === 0) return true;
    return permissionNames.every(name => hasPermission(name));
  };

  return {
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
  };
};

