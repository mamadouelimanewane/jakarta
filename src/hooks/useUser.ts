'use client'
import { useState, useEffect } from 'react'

export function useUser() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/me')
      .then(r => r.ok ? r.json() : null)
      .then(d => { setUser(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return { user, loading, setUser }
}
