'use client'

import dynamic from 'next/dynamic'

// Importar el mapa de forma dinámica para evitar problemas con SSR
const Map = dynamic(() => import('@/components/map/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden shadow-lg bg-gray-200 flex items-center justify-center">
      <p className="text-gray-500">Cargando mapa...</p>
    </div>
  )
})

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Bienvenido al Dashboard
        </h1>
        <p className="text-gray-600">
          Selecciona una opción del menú lateral para comenzar.
        </p>
      </div>

      {/* Mapa */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Mapa de Vehículos
        </h2>
        <Map />
      </div>
    </div>
  )
}
