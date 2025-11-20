// Sale types
export interface CreateSaleDetailDto {
  id_product: number
  id_batch?: number
  quantity: number
  unit_type: string
  unit_price: number
  discount?: number
  subtotal: number
  notes?: string
}

export interface CreateSaleDto {
  sale_number?: string
  id_client: number
  id_company: number
  id_user: number
  id_route?: number
  subtotal: number
  discount?: number
  tax?: number
  total: number
  status?: string
  payment_method?: string
  payment_status?: string
  notes?: string
  details: CreateSaleDetailDto[]
}

export interface SaleDetail {
  id_sale_detail: number
  id_sale: number
  id_product: number
  id_batch?: number
  quantity: number
  unit_type: string
  unit_price: number
  discount?: number
  subtotal: number
  notes?: string
  created_at?: string
  modified_at?: string | null
  deleted_at?: string | null
  // Relaciones
  product_name?: string
  product_sku?: string
}

export interface Sale {
  id_sale: number
  sale_number?: string
  id_client: number
  id_company: number
  id_user: number
  id_route?: number
  subtotal: number
  discount?: number
  tax?: number
  total: number
  status?: string
  payment_method?: string
  payment_status?: string
  notes?: string
  created_at?: string
  modified_at?: string | null
  deleted_at?: string | null
  // Relaciones
  client_name?: string
  client_identification?: string
  user_name?: string
  route_name?: string
  details?: SaleDetail[]
}

export interface SaleResponse {
  message: string
  data: Sale
}

export interface SalesListResponse {
  message: string
  data: Sale[]
}

