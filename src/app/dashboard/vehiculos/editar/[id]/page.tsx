'use client'

import { useParams } from 'next/navigation'
import { EditVehicleView } from '@/views/vehiculos/EditVehicleView'

export default function EditarVehiculoPage() {
  const params = useParams()
  const id = Number(params.id)

  return <EditVehicleView vehicleId={id} />
}
