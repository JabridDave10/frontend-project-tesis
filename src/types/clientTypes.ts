// Client types
export interface CreateClientDto {
  name: string
  identification: string
  email: string
  phone: string
  address: string
}

export interface Client {
  id_client: number
  name: string
  identification: string
  email: string
  phone: string
  address: string
  created_at?: string
  modified_at?: string | null
  deleted_at?: string | null
}

export interface ClientResponse {
  message: string
  data: Client
}

export interface ClientsListResponse {
  message: string
  data: Client[]
}
