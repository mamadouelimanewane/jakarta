'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DemoPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'connecting' | 'success' | 'error'>('connecting')

  useEffect(() => {
    async function autoLogin() {
      try {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'login', telephone: '770000001', password: 'demo123' }),
        })
        if (res.ok) {
          setStatus('success')
          setTimeout(() => router.push('/dashboard'), 800)
        } else {
          setStatus('error')
        }
      } catch {
        setStatus('error')
      }
    }
    autoLogin()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003366] to-[#0055a4] flex items-center justify-center p-6">
      <div className="text-center">
        <div className="text-6xl mb-6">
          {status === 'connecting' && <span className="animate-bounce inline-block">🏍️</span>}
          {status === 'success' && '✅'}
          {status === 'error' && '❌'}
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          {status === 'connecting' && 'Connexion en cours…'}
          {status === 'success' && 'Connecté !'}
          {status === 'error' && 'Connexion impossible'}
        </h1>
        <p className="text-white/70 text-sm">
          {status === 'connecting' && 'Accès à votre espace Jakarta'}
          {status === 'success' && 'Redirection vers votre tableau de bord…'}
          {status === 'error' && 'Vérifiez votre connexion internet et réessayez.'}
        </p>

        {status === 'error' && (
          <button
            onClick={() => { setStatus('connecting'); }}
            className="mt-6 px-6 py-3 bg-yellow-400 text-[#003366] font-bold rounded-xl hover:bg-yellow-300 transition-colors"
          >
            Réessayer
          </button>
        )}

        {status === 'connecting' && (
          <div className="mt-8 flex justify-center gap-1">
            <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>
    </div>
  )
}
