// Tipos para el registro de usuarios
export interface RegisterUserDto {
  first_name: string;
  last_name: string;
  identification: string;
  birthdate: string;
  email: string;
  phone: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    identification: string;
    birthdate: string;
    email: string;
    phone: string;
  };
}

export interface ValidationError {
  property: string;
  value: any;
  constraints: {
    [key: string]: string;
  };
}

export interface ErrorResponse {
  message?: string;
  error?: string;
  errors?: ValidationError[];
}

// Tipos para el login
export interface LoginUserDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
}
