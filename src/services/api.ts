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

  // Interceptor de request - Ya no necesitas manejar el token manualmente
  // Las cookies se envían automáticamente por el navegador
  apiInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Ya no necesitas agregar el token aquí
      // El navegador envía automáticamente la cookie 'access_token' si existe
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

        // Si el login fue exitoso, el token ya está guardado en cookies automáticamente
        // No necesitas guardarlo en localStorage
        if (response.config.url?.includes('/auth/login') && response.data?.user) {
          console.log('✅ Login exitoso - Token guardado en cookies automáticamente')
          // Opcional: Guardar datos del usuario en localStorage si los necesitas
          if (typeof window !== 'undefined') {
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