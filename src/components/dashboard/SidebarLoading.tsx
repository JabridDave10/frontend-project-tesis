export const SidebarLoading = () => {
  return (
    <div className="px-4 py-3 space-y-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-2.5">
          <div className="w-5 h-5 rounded bg-white/10 animate-pulse" />
          <div className="h-3 rounded bg-white/10 animate-pulse" style={{ width: `${60 + i * 8}%` }} />
        </div>
      ))}
    </div>
  )
}
