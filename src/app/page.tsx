'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir automáticamente al login cuando se accede a la página principal
    router.push('/auth/login')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Redirigiendo al login...
        </h1>
        <p className="text-gray-600">
          Si no eres redirigido automáticamente, 
          <a href="/auth/login" className="text-blue-600 hover:underline ml-1">
            haz clic aquí
          </a>
        </p>
      </div>
    </div>
  )
}
