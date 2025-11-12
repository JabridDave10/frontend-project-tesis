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
  const [showCompanyModal, setShowCompanyModal] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Verificar si el usuario tiene id_company
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          if (!user.id_company) {
            // Si no tiene id_company, mostrar el modal
            setShowCompanyModal(true)
          }
        } catch (error) {
          console.error('Error al parsear usuario:', error)
        }
      }
      setIsChecking(false)
    }
  }, [])

  const handleCompanySuccess = () => {
    // Cuando se registre la empresa exitosamente, cerrar el modal
    // El modal ya actualizó el usuario en localStorage
    setShowCompanyModal(false)
  }

  // Mientras se verifica, no mostrar nada
  if (isChecking) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader title="Dashboard" />
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
