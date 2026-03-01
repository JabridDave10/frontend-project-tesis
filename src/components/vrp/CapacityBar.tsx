'use client'

interface CapacityBarProps {
  label: string
  current: number
  max: number
  unit: string
  colorClass?: string
}

export function CapacityBar({ label, current, max, unit, colorClass }: CapacityBarProps) {
  const pct = max > 0 ? Math.min((current / max) * 100, 100) : 0
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
          {current.toLocaleString('es-CO', { maximumFractionDigits: 1 })} / {max.toLocaleString('es-CO', { maximumFractionDigits: 1 })} {unit}
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
