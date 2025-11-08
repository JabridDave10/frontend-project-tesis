// Tipos para Permisos
export interface Permission {
  id: number;
  nombre: string;
  created_at: string;
  modified_at: string | null;
  deleted_at: string | null;
}

// Tipos para Roles
export interface Role {
  id: number;
  nombre: string;
  created_at: string;
  modified_at: string | null;
  deleted_at: string | null;
  permissions?: Permission[];
}

// Tipos para la tabla intermedia RolePermissions
export interface RolePermission {
  id: number;
  id_role: number;
  id_permission: number;
  created_at: string;
  modified_at: string | null;
  deleted_at: string | null;
  permission?: Permission;
  role?: Role;
}

// Respuesta del backend con permisos del usuario
export interface UserPermissionsResponse {
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role?: Role;
  };
  permissions: Permission[];
}

