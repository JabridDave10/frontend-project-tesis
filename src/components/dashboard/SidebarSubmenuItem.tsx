import Link from 'next/link'

interface SidebarSubmenuItemProps {
  name: string
  href: string
  isActive: boolean
}

export const SidebarSubmenuItem = ({ name, href, isActive }: SidebarSubmenuItemProps) => {
  return (
    <Link
      href={href}
      className={`block px-3 py-2 rounded-md text-sm transition-all duration-200 ${
        isActive
          ? 'text-cyan-300 bg-white/10 font-medium'
          : 'text-blue-200/60 hover:text-white hover:bg-white/5'
      }`}
    >
      {name}
    </Link>
  )
}
