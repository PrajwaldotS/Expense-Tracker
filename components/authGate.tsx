'use client'

import { useEffect, useState } from 'react'

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
  }, [])

  if (isLoggedIn === null) return null

  return isLoggedIn ? <>{children}</> : null
}
