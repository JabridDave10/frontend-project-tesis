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
      className={`block px-6 py-2 pl-14 text-sm hover:bg-blue-700 transition-colors ${
        isActive ? 'bg-blue-700' : ''
      }`}
    >
      {name}
    </Link>
  )
}

