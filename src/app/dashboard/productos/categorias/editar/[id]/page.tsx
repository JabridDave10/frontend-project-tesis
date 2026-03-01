'use client'

import { useParams } from 'next/navigation'
import { EditCategoryView } from '@/views/productos/EditCategoryView'

export default function EditarCategoriaPage() {
  const params = useParams()
  const id = Number(params.id)

  return <EditCategoryView categoryId={id} />
}
