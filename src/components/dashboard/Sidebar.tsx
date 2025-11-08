'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { usePermissions } from '@/hooks/usePermissions'
import { SidebarLogo } from './SidebarLogo'
import { SidebarMenuItem } from './SidebarMenuItem'
import { SidebarLoading } from './SidebarLoading'

interface MenuItem {
  name: string
  href: string
  icon: React.ReactNode
  permission?: string
  submenu?: { name: string; href: string; permission?: string }[]
}

export const Sidebar = () => {
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = useState<string[]>([])
  const { hasPermission, loading } = usePermissions()

  const toggleMenu = (menuName: string) => {
    setOpenMenus(prev =>
      prev.includes(menuName)
        ? prev.filter(m => m !== menuName)
        : [...prev, menuName]
    )
  }

  const menuItems: MenuItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      //permission: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      name: 'Rutas',
      href: '/dashboard/rutas',
      //permission: 'Rutas',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      )
    },
    {
      name: 'Empleados',
      href: '#',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      //permission: 'Empleados',
      submenu: [
        { name: 'Administrativos', href: '/dashboard/empleados/administrativos', /* permission: 'Administrativos' */ },
        { name: 'Conductores', href: '/dashboard/empleados/conductores', /* permission: 'Conductores' */ },
        { name: 'Agregar', href: '/dashboard/empleados/agregar', /* //permission: 'Agregar'  */},
        { name: 'Editar', href: '/dashboard/empleados/editar', /* //permission: 'Editar' */ },
        { name: 'Eliminar', href: '/dashboard/empleados/eliminar', /* //permission: 'Eliminar'  */}
      ]
    },
    {
      name: 'Camiones',
      href: '/dashboard/camiones',
      //permission: 'Camiones',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      )
    },
    {
      name: 'Configuraciones',
      href: '/dashboard/configuraciones',
      //permission: 'Configuraciones',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ]

  const filteredMenuItems = menuItems.filter((item) => {
    // Si no tiene permiso especificado, mostrar por defecto
    if (!item.permission) return true
    // Verificar si el usuario tiene el permiso
    return hasPermission(item.permission)
  })

  return (
    <aside className="w-64 bg-gradient-to-b from-blue-600 to-blue-800 text-white min-h-screen flex flex-col">
      <SidebarLogo />

      <nav className="flex-1 py-4">
        {loading ? (
          <SidebarLoading />
        ) : (
          filteredMenuItems.map((item) => (
            <SidebarMenuItem
              key={item.name}
              name={item.name}
              href={item.href}
              icon={item.icon}
              permission={item.permission}
              submenu={item.submenu}
              isActive={pathname === item.href}
              isOpen={openMenus.includes(item.name)}
              onToggle={() => toggleMenu(item.name)}
              currentPath={pathname}
              hasPermission={hasPermission}
            />
          ))
        )}
      </nav>
    </aside>
  )
}
