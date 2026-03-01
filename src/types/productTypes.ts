// ==================== ENUMS ====================

export enum UnitTypeEnum {
  WEIGHT = 'weight',
  VOLUME = 'volume',
  UNIT = 'unit',
  PALLET = 'pallet',
  BOX = 'box',
  CUSTOM = 'custom',
}

export enum StorageType {
  AMBIENT = 'ambient',
  REFRIGERATED = 'refrigerated',
  FROZEN = 'frozen',
  CONTROLLED = 'controlled',
}

export enum MovementType {
  ENTRY = 'entry',
  EXIT = 'exit',
  TRANSFER = 'transfer',
  ADJUSTMENT = 'adjustment',
  RESERVATION = 'reservation',
  DISPATCH = 'dispatch',
  RETURN = 'return',
}

export enum BatchStatus {
  AVAILABLE = 'available',
  RESERVED = 'reserved',
  IN_TRANSIT = 'in_transit',
  EXPIRED = 'expired',
  QUARANTINE = 'quarantine',
  DAMAGED = 'damaged',
}

// ==================== LABELS ====================

export const UNIT_TYPE_LABELS: Record<UnitTypeEnum, string> = {
  [UnitTypeEnum.WEIGHT]: 'Peso (kg)',
  [UnitTypeEnum.VOLUME]: 'Volumen (L)',
  [UnitTypeEnum.UNIT]: 'Unidades',
  [UnitTypeEnum.PALLET]: 'Pallets',
  [UnitTypeEnum.BOX]: 'Cajas',
  [UnitTypeEnum.CUSTOM]: 'Personalizado',
};

export const STORAGE_TYPE_LABELS: Record<StorageType, string> = {
  [StorageType.AMBIENT]: 'Ambiente',
  [StorageType.REFRIGERATED]: 'Refrigerado',
  [StorageType.FROZEN]: 'Congelado',
  [StorageType.CONTROLLED]: 'Controlado',
};

export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  [MovementType.ENTRY]: 'Entrada',
  [MovementType.EXIT]: 'Salida',
  [MovementType.TRANSFER]: 'Transferencia',
  [MovementType.ADJUSTMENT]: 'Ajuste',
  [MovementType.RESERVATION]: 'Reserva',
  [MovementType.DISPATCH]: 'Despacho',
  [MovementType.RETURN]: 'Devolución',
};

export const BATCH_STATUS_LABELS: Record<BatchStatus, string> = {
  [BatchStatus.AVAILABLE]: 'Disponible',
  [BatchStatus.RESERVED]: 'Reservado',
  [BatchStatus.IN_TRANSIT]: 'En tránsito',
  [BatchStatus.EXPIRED]: 'Vencido',
  [BatchStatus.QUARANTINE]: 'En cuarentena',
  [BatchStatus.DAMAGED]: 'Dañado',
};

// ==================== INTERFACES ====================

export interface ProductCategory {
  id_category: number;
  id_company: number;
  name: string;
  description?: string;
  default_storage_type?: StorageType;
  icon?: string;
  color?: string;
  created_at: Date;
  modified_at: Date;
  deleted_at?: Date;
  product_count?: number; // Agregado por el backend en consultas
}

export interface Product {
  id_product: number;
  id_company: number;
  id_category?: number;
  sku: string;
  name: string;
  description?: string;
  primary_unit_type: UnitTypeEnum;
  primary_unit_name: string;
  weight_per_unit?: number;
  volume_per_unit?: number;
  width?: number;
  height?: number;
  length?: number;
  requires_refrigeration: boolean;
  min_temperature?: number;
  max_temperature?: number;
  is_fragile: boolean;
  is_hazardous: boolean;
  requires_batch_control: boolean;
  requires_expiry_date: boolean;
  photo?: string;
  notes?: string;
  created_at: Date;
  modified_at: Date;
  deleted_at?: Date;
  category_name?: string; // Agregado por el backend
}

export interface Stock {
  id_stock: number;
  id_product: number;
  id_warehouse: number;
  quantity_available: number;
  reserved_quantity: number;
  unit_type: string;
  updated_by: number;
  last_updated: Date;
  product_name?: string;
  sku?: string;
  warehouse_name?: string;
  warehouse_address?: string;
  primary_unit_name?: string;
}

export interface StockMovement {
  id_movement: number;
  id_product: number;
  id_warehouse_origin?: number;
  id_warehouse_destination?: number;
  id_batch?: number;
  movement_type: MovementType;
  quantity: number;
  unit_type: string;
  reference_number?: string;
  notes?: string;
  created_by: number;
  created_at: Date;
  product_name?: string;
  sku?: string;
  origin_name?: string;
  origin_address?: string;
  destination_name?: string;
  destination_address?: string;
  first_name?: string;
  last_name?: string;
}

export interface ProductBatch {
  id_batch: number;
  id_product: number;
  id_warehouse: number;
  batch_number: string;
  manufactured_date?: Date;
  expiry_date?: Date;
  initial_quantity: number;
  quantity: number;
  unit_type: string;
  status: BatchStatus;
  notes?: string;
  created_at: Date;
  modified_at: Date;
}

export interface Warehouse {
  id_warehouse: number;
  name: string;
  address: string;
  id_company: number;
  id_status: number;
  created_at: Date;
  modified_at: Date;
  deleted_at?: Date;
  stock_count?: number;
}

// ==================== DTOs ====================

export interface CreateProductCategoryDto {
  id_company: number;
  name: string;
  description?: string;
  default_storage_type?: StorageType;
  icon?: string;
  color?: string;
}

export interface UpdateProductCategoryDto {
  name?: string;
  description?: string;
  default_storage_type?: StorageType;
  icon?: string;
  color?: string;
}

export interface CreateProductDto {
  id_company: number;
  id_category?: number;
  sku: string;
  name: string;
  description?: string;
  primary_unit_type: UnitTypeEnum;
  primary_unit_name: string;
  weight_per_unit?: number;
  volume_per_unit?: number;
  width?: number;
  height?: number;
  length?: number;
  requires_refrigeration?: boolean;
  min_temperature?: number;
  max_temperature?: number;
  is_fragile?: boolean;
  is_hazardous?: boolean;
  requires_batch_control?: boolean;
  requires_expiry_date?: boolean;
  photo?: string;
  notes?: string;
}

export interface UpdateProductDto {
  id_category?: number;
  sku?: string;
  name?: string;
  description?: string;
  primary_unit_type?: UnitTypeEnum;
  primary_unit_name?: string;
  weight_per_unit?: number;
  volume_per_unit?: number;
  width?: number;
  height?: number;
  length?: number;
  requires_refrigeration?: boolean;
  min_temperature?: number;
  max_temperature?: number;
  is_fragile?: boolean;
  is_hazardous?: boolean;
  requires_batch_control?: boolean;
  requires_expiry_date?: boolean;
  photo?: string;
  notes?: string;
}

export interface CreateStockMovementDto {
  id_product: number;
  id_warehouse_origin?: number;
  id_warehouse_destination?: number;
  id_batch?: number;
  movement_type: MovementType;
  quantity: number;
  unit_type: string;
  reference_number?: string;
  notes?: string;
  created_by: number;
}

export interface CreateWarehouseDto {
  name: string;
  address: string;
  id_company: number;
  id_status?: number;
}

export interface UpdateWarehouseDto {
  name?: string;
  address?: string;
  id_status?: number;
}

export interface ReserveStockDto {
  id_product: number;
  id_warehouse: number;
  quantity: number;
  reserved_by: number;
}

// ==================== RESPONSE TYPES ====================

export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface StockAvailabilityResponse {
  available: boolean;
  productId: number;
  warehouseId: number;
  requestedQuantity: number;
}
