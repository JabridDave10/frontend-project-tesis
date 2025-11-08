interface SidebarLogoProps {
  companyName?: string
}

export const SidebarLogo = ({ companyName = 'Transportadora Algrt' }: SidebarLogoProps) => {
  return (
    <div className="p-6 flex flex-col items-center border-b border-blue-500">
      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3">
        <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-xl">M</span>
        </div>
      </div>
      <h1 className="text-sm font-semibold text-center">
        {companyName}
      </h1>
    </div>
  )
}

