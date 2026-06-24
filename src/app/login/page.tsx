'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ telephone: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', ...form }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Erreur de connexion'); setLoading(false); return }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003366] to-[#0055a4] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏍️</div>
          <h1 className="text-3xl font-extrabold text-white">J@KARTA</h1>
          <p className="text-white/70 mt-1">Connectez-vous à votre espace</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={submit} className="space-y-5">
            <Input
              label="Numéro de téléphone"
              type="tel"
              placeholder="77 000 00 00"
              value={form.telephone}
              onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))}
              required
            />
            <Input
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Se connecter
            </Button>
          </form>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
            <strong>Compte démo :</strong> 770000001 / demo123
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Pas encore inscrit ?{' '}
            <Link href="/register" className="text-blue-600 font-semibold hover:underline">Créer un compte</Link>
          </p>
          <p className="text-center mt-3">
            <Link href="/" className="text-xs text-gray-400 hover:text-gray-600">← Retour à l&apos;accueil</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
