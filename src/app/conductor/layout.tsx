import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Conductor - GPS Tracking',
  description: 'App de seguimiento GPS para conductores',
}

export default function ConductorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#0F2140] to-[#001F3F]">
      {children}
    </div>
  )
}
