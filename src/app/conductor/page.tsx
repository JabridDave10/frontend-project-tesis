'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ConductorEntryPoint() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token')
    router.replace(token ? '/conductor/tracking' : '/auth/login')
  }, [router])

  return null
}
