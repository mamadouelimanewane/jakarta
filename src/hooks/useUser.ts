'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useUser(redirectIfUnauth = true) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/me')
      .then(r => {
        if (r.status === 401 && redirectIfUnauth) {
          router.replace('/login')
          return null
        }
        return r.ok ? r.json() : null
      })
      .then(d => { setUser(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [redirectIfUnauth, router])

  return { user, loading, setUser }
}
