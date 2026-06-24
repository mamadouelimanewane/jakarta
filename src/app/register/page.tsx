'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ telephone: '', prenom: '', nom: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Les mots de passe ne correspondent pas'); return }
    if (form.password.length < 6) { setError('Mot de passe trop court (min. 6 caractères)'); return }
    setLoading(true)
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', telephone: form.telephone, prenom: form.prenom, nom: form.nom, email: form.email || undefined, password: form.password }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || "Erreur d'inscription"); setLoading(false); return }
    router.push('/dashboard')
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003366] to-[#0055a4] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏍️</div>
          <h1 className="text-3xl font-extrabold text-white">Rejoignez J@KARTA</h1>
          <p className="text-white/70 mt-1">Créez votre compte conducteur gratuitement</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Prénom" placeholder="Moussa" value={form.prenom} onChange={set('prenom')} required />
              <Input label="Nom" placeholder="Diallo" value={form.nom} onChange={set('nom')} required />
            </div>
            <Input label="Téléphone *" type="tel" placeholder="77 000 00 00" value={form.telephone} onChange={set('telephone')} required hint="Utilisé comme identifiant de connexion" />
            <Input label="Email (optionnel)" type="email" placeholder="vous@email.com" value={form.email} onChange={set('email')} />
            <Input label="Mot de passe *" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} required />
            <Input label="Confirmer le mot de passe *" type="password" placeholder="••••••••" value={form.confirm} onChange={set('confirm')} required />
            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Créer mon compte
            </Button>
          </form>
          <p className="text-center text-xs text-gray-400 mt-4">
            En vous inscrivant, vous acceptez nos <span className="underline cursor-pointer">CGU</span> et notre <span className="underline cursor-pointer">Politique de confidentialité</span>
          </p>
          <p className="text-center text-sm text-gray-500 mt-4">
            Déjà inscrit ?{' '}
            <Link href="/login" className="text-blue-600 font-semibold hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
