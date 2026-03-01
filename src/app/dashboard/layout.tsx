'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check auth and role
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/auth/login')
      return
    }

    try {
      const user = JSON.parse(userStr)
      // Role 2 = Conductor -> redirect to conductor app
      if (Number(user.id_role) === 2) {
        router.push('/conductor/tracking')
        return
      }
      setIsAuthorized(true)
    } catch {
      router.push('/auth/login')
    }

    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [router])

  if (!isAuthorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title="Dashboard" onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
