import Link from 'next/link'
import { SidebarSubmenu } from './SidebarSubmenu'

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

    return (
      <div>
        <button
          onClick={onToggle}
          className="w-full px-6 py-3 flex items-center justify-between hover:bg-blue-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            {icon}
            <span className="text-sm">{name}</span>
          </div>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
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
      className={`px-6 py-3 flex items-center gap-3 hover:bg-blue-700 transition-colors ${
        isActive ? 'bg-blue-700' : ''
      }`}
    >
      {icon}
      <span className="text-sm">{name}</span>
    </Link>
  )
}

