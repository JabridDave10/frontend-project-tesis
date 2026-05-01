'use client'

interface CapacityBarProps {
  label: string
  current: number | string
  max: number | string
  unit: string
  colorClass?: string
}

export function CapacityBar({ label, current, max, unit, colorClass }: CapacityBarProps) {
  // Coerce: API values can arrive as strings (Postgres numeric columns).
  const cur = Number(current) || 0
  const lim = Number(max) || 0
  const pct = lim > 0 ? Math.min((cur / lim) * 100, 100) : 0
  const rounded = Math.round(pct)

  const barColor = colorClass
    ? colorClass
    : pct > 90
      ? 'bg-red-500'
      : pct > 70
        ? 'bg-amber-500'
        : 'bg-gradient-to-r from-blue-500 to-cyan-500'

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-500 font-medium">{label}</span>
        <span className="text-slate-600">
          {cur.toLocaleString('es-CO', { maximumFractionDigits: 1 })} / {lim.toLocaleString('es-CO', { maximumFractionDigits: 1 })} {unit}
          <span className={`ml-1.5 font-bold ${pct > 90 ? 'text-red-600' : pct > 70 ? 'text-amber-600' : 'text-blue-600'}`}>
            {rounded}%
          </span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
