// Company types
export interface CreateCompanyDto {
  name: string
  email: string
  password: string
}

export interface Company {
  id: number
  name: string
  email: string
  created_at?: string
  modified_at?: string | null
  deleted_at?: string | null
}

export interface CompanyResponse {
  message?: string
  company?: Company
}
  