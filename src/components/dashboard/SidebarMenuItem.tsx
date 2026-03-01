import Link from 'next/link'
import { SidebarSubmenu } from './SidebarSubmenu'
import { ChevronDown } from 'lucide-react'

interface SubmenuItem {
  name: string
  href: string
  permission?: string
}

interface SidebarMenuItemProps {
  name: string
  href: string
  icon: React.ReactNode
  permission?: string
  submenu?: SubmenuItem[]
  isActive: boolean
  isOpen: boolean
  onToggle: () => void
  currentPath: string
  hasPermission: (permission: string) => boolean
}

export const SidebarMenuItem = ({
  name,
  href,
  icon,
  submenu,
  isActive,
  isOpen,
  onToggle,
  currentPath,
  hasPermission
}: SidebarMenuItemProps) => {
  if (submenu) {
    const filteredSubmenu = submenu.filter((item) => {
      if (!item.permission) return true
      return hasPermission(item.permission)
    })

    if (filteredSubmenu.length === 0) return null

    const isSubmenuActive = filteredSubmenu.some(item => currentPath === item.href)

    return (
      <div>
        <button
          onClick={onToggle}
          className={`w-full px-4 py-2.5 mx-2 rounded-lg flex items-center justify-between transition-all duration-200 ${
            isSubmenuActive
              ? 'bg-white/10 text-cyan-300'
              : 'text-blue-100/70 hover:bg-white/5 hover:text-white'
          }`}
          style={{ width: 'calc(100% - 16px)' }}
        >
          <div className="flex items-center gap-3">
            <span className={isSubmenuActive ? 'text-cyan-400' : ''}>{icon}</span>
            <span className="text-sm font-medium">{name}</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
        {isOpen && (
          <SidebarSubmenu
            items={filteredSubmenu}
            currentPath={currentPath}
            hasPermission={hasPermission}
          />
        )}
      </div>
    )
  }

  return (
    <Link
      href={href}
      className={`mx-2 px-4 py-2.5 rounded-lg flex items-center gap-3 transition-all duration-200 ${
        isActive
          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-white border border-cyan-500/20 shadow-lg shadow-cyan-500/5'
          : 'text-blue-100/70 hover:bg-white/5 hover:text-white'
      }`}
    >
      <span className={isActive ? 'text-cyan-400' : ''}>{icon}</span>
      <span className="text-sm font-medium">{name}</span>
      {isActive && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
      )}
    </Link>
  )
}
