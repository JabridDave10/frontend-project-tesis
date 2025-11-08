import { SidebarSubmenuItem } from './SidebarSubmenuItem'

interface SubmenuItem {
  name: string
  href: string
  permission?: string
}

interface SidebarSubmenuProps {
  items: SubmenuItem[]
  currentPath: string
  hasPermission: (permission: string) => boolean
}

export const SidebarSubmenu = ({ items, currentPath, hasPermission }: SidebarSubmenuProps) => {
  const filteredItems = items.filter((item) => {
    if (!item.permission) return true
    return hasPermission(item.permission)
  })

  if (filteredItems.length === 0) return null

  return (
    <div className="bg-blue-900 bg-opacity-50">
      {filteredItems.map((item) => (
        <SidebarSubmenuItem
          key={item.name}
          name={item.name}
          href={item.href}
          isActive={currentPath === item.href}
        />
      ))}
    </div>
  )
}

