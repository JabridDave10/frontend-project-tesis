'use client'

import { useParams } from 'next/navigation'
import { EditProductView } from '@/views/productos/EditProductView'

export default function EditarProductoPage() {
  const params = useParams()
  const id = Number(params.id)

  return <EditProductView productId={id} />
}
