'use client'

import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { decryptData } from './crypto'

// URL base del backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

/**
 * Crea una nueva instancia de axios con interceptores para manejo de cookies
 */
const createAxiosInstance = (): AxiosInstance => {
  const baseURL = API_URL

  console.log(`🔧 Inicializando Axios con baseURL: ${baseURL}`)

  const apiInstance = axios.create({
    baseURL: baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true, // ⚠️ IMPORTANTE: Esto permite enviar/recibir cookies automáticamente
  })

  // Interceptor de request - Enviar token como Bearer header (necesario para cross-origin)
  apiInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Interceptor de respuesta - Maneja desencriptación y errores
  apiInstance.interceptors.response.use(
    async (response) => {
      try {
        // Desencriptar respuesta si viene encriptada
        if (response.data?.encrypted) {
          response.data = decryptData(response.data.encrypted)
        }

        // Guardar token y usuario en localStorage para cross-origin requests
        if (response.config.url?.includes('/auth/login') && response.data?.user) {
          if (typeof window !== 'undefined') {
            if (response.data.access_token) {
              localStorage.setItem('access_token', response.data.access_token)
            }
            localStorage.setItem('user', JSON.stringify(response.data.user))
          }
        }

      } catch (err) {
        console.error('Error en interceptor de respuesta:', err)
      }

      return response
    },
    async (error) => {
      // Desencriptar errores si vienen cifrados
      try {
        if (error.response?.data?.encrypted) {
          error.response.data = decryptData(error.response.data.encrypted)
        }
      } catch (err) {
        console.error('Error al desencriptar error:', err)
      }

      // Manejar error 401 - Sesión expirada
      if (error.response?.status === 401) {
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''

        // No redirigir si estamos en rutas de autenticación
        if (!currentPath.includes('/auth/') && !currentPath.includes('/conductor')) {
          console.error('Error 401 - Sesión expirada o token inválido')

          // Limpiar datos del usuario
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user')
            localStorage.removeItem('token')
            localStorage.removeItem('access_token')
            localStorage.removeItem('driver')
            localStorage.removeItem('activeRoute')

            // Redirigir al login solo si no estamos ya ahí
            if (!currentPath.includes('/auth/login')) {
              window.location.href = '/auth/login'
            }
          }
        }
      }

      return Promise.reject(error)
    }
  )

  return apiInstance
}

// Instancia única de axios
export const api: AxiosInstance = createAxiosInstance()

// Ya no necesitas estas funciones porque no usas localStorage para el token
// El navegador maneja las cookies automáticamente