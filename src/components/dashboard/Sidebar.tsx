'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  LandPlot,
  Map,
  ShoppingCart,
  Users,
  UserCog,
  Truck,
  Package,
  Settings
} from 'lucide-react'
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

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
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
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      name: 'Planificar Rutas',
      href: '/dashboard/planroutes',
      icon: <LandPlot className="w-5 h-5" />
    },
    {
      name: 'Rutas',
      href: '/dashboard/rutas',
      icon: <Map className="w-5 h-5" />
    },
    {
      name: 'Ventas',
      href: '/dashboard/ventas',
      icon: <ShoppingCart className="w-5 h-5" />
    },
    {
      name: 'Clientes',
      href: '/dashboard/clientes',
      icon: <Users className="w-5 h-5" />
    },
    {
      name: 'Empleados',
      href: '#',
      icon: <UserCog className="w-5 h-5" />,
      submenu: [
        { name: 'Administrativos', href: '/dashboard/empleados/administrativos' },
        { name: 'Conductores', href: '/dashboard/empleados/conductores' },
        { name: 'Agregar', href: '/dashboard/empleados/agregar' },
        { name: 'Editar', href: '/dashboard/empleados/editar' },
        { name: 'Eliminar', href: '/dashboard/empleados/eliminar' }
      ]
    },
    {
      name: 'Vehiculos',
      href: '/dashboard/vehiculos',
      icon: <Truck className="w-5 h-5" />
    },
    {
      name: 'Productos',
      href: '#',
      icon: <Package className="w-5 h-5" />,
      submenu: [
        { name: 'Ver Productos', href: '/dashboard/productos' },
        { name: 'Agregar Producto', href: '/dashboard/productos/agregar' },
        { name: 'Categorías', href: '/dashboard/productos/categorias' },
        { name: 'Inventario', href: '/dashboard/productos/inventario' },
      ]
    },
    {
      name: 'Configuraciones',
      href: '/dashboard/configuraciones',
      icon: <Settings className="w-5 h-5" />
    }
  ]

  const filteredMenuItems = menuItems.filter((item) => {
    if (!item.permission) return true
    return hasPermission(item.permission)
  })

  return (
    <aside
      className={`${
        isOpen ? 'w-64' : 'w-0 overflow-hidden'
      } bg-gradient-to-b from-[#0A1628] to-[#001F3F] text-white min-h-screen flex flex-col transition-all duration-300 relative`}
    >
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full">
        <SidebarLogo />

        <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
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

        {/* Bottom system status */}
        <div className="px-6 py-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-cyan-300/60 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            SYSTEM ONLINE
          </div>
        </div>
      </div>
    </aside>
  )
}
