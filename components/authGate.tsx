'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      router.replace('/') // redirect to login
    } else {
      setIsLoggedIn(true)
    }
  }, [router])

  if (isLoggedIn === null) {
    return <div>Checking authentication...</div>
  }

  return <>{children}</>
}
