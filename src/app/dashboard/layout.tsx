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
  const [showCompanyModal, setShowCompanyModal] = useState(false)

  // Verificar si el usuario tiene empresa al cargar
  // useEffect(() => {
  //   if (typeof window !== 'undefined') {
  //     const userStr = localStorage.getItem('user')
  //     if (userStr) {
  //       try {
  //         const user = JSON.parse(userStr)
  //         // Mostrar el modal si no tiene id_company
  //         if (!user.id_company) {
  //           setShowCompanyModal(true)
  //         }
  //       } catch (error) {
  //         console.error('Error al leer usuario:', error)
  //       }
  //     }
  //   }
  // }, [])

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

  const handleCompanySuccess = () => {
    // Cerrar el modal después de crear la empresa
    setShowCompanyModal(false)
  }

  const handleCloseModal = () => {
    setShowCompanyModal(false)
  }

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
        onClose={handleCloseModal}
        onSuccess={handleCompanySuccess}
        required={true}
      /> */}
    </div>
  )
}
