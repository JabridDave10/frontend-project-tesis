import { Truck } from 'lucide-react'

interface SidebarLogoProps {
  companyName?: string
}

export const SidebarLogo = ({ companyName = 'Transportadora' }: SidebarLogoProps) => {
  return (
    <div className="px-6 py-5 flex items-center gap-3 border-b border-white/10">
      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
        <Truck className="w-5 h-5 text-white" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-bold text-white tracking-wide">{companyName}</span>
        <span className="text-[10px] text-cyan-300/60 font-mono">LOGISTICS PLATFORM</span>
      </div>
    </div>
  )
}
