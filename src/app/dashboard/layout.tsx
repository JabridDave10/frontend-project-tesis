'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { CompanyRegistrationModal } from '@/components/company/CompanyRegistrationModal'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // En móvil, el sidebar empieza cerrado
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
      }
    }

    // Ejecutar al montar el componente
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex-1 flex flex-col">
        <DashboardHeader title="Dashboard" onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Modal de registro de empresa - Obligatorio si no tiene id_company */}
      {/* <CompanyRegistrationModal
        open={showCompanyModal}
        onSuccess={handleCompanySuccess}
        required={true}
      /> */}
    </div>
  )
}
