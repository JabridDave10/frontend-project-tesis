'use client'

import { useParams } from 'next/navigation'
import { EditDriverView } from '@/views/conductores/EditDriverView'

export default function EditarConductorPage() {
  const params = useParams()
  const id = Number(params.id)

  return <EditDriverView driverId={id} />
}
