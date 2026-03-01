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
    <div className="ml-4 mr-2 mt-1 mb-1 pl-4 border-l border-white/10 space-y-0.5">
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
