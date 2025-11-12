// Company types
export interface CreateCompanyDto {
  name: string
  nit?: string
  logo?: string
}

export interface Company {
  id_company: number
  name: string
  nit: string
  logo: string
  created_at?: string
  modified_at?: string | null
  deleted_at?: string | null
}

export interface CompanyResponse {
  message?: string
  company?: Company
}
  