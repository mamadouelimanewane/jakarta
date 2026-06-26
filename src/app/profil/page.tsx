'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useUser } from '@/hooks/useUser'
import { getStatutColor, getStatutLabel } from '@/lib/utils'

export default function ProfilPage() {
  const { user, setUser } = useUser()
  const router = useRouter()
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', adresse: '', date_naissance: '', numero_cni: '' })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  async function logout() {
    await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) })
    router.push('/login')
  }

  useEffect(() => {
    if (user) {
      setForm({
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
        adresse: user.conducteur?.adresse || '',
        date_naissance: user.conducteur?.date_naissance || '',
        numero_cni: user.conducteur?.numero_cni || '',
      })
    }
  }, [user])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setMsg('')
    const r = await fetch('/api/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (r.ok) { setMsg('Profil mis à jour avec succès ✅') }
    else { setMsg('Erreur lors de la mise à jour') }
    setLoading(false)
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  const pct = user ? [
    !!user.nom, !!user.prenom, !!user.email, !!user.telephone,
    !!user.conducteur?.adresse, !!user.conducteur?.numero_cni,
    user.statut_kyc === 'VALIDE'
  ].filter(Boolean).length / 7 * 100 : 0

  return (
    <AppLayout user={user}>
        <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6 space-y-4 lg:space-y-6">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Mon Profil</h1>
            <p className="text-gray-500 mt-1 text-sm">Gérez vos informations personnelles</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            {/* Carte profil */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-3">
                {user?.prenom?.[0]}{user?.nom?.[0]}
              </div>
              <h2 className="text-lg font-bold text-gray-900">{user?.prenom} {user?.nom}</h2>
              <p className="text-sm text-gray-400">{user?.telephone}</p>
              <div className="mt-3 flex justify-center gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatutColor(user?.statut_kyc || 'EN_ATTENTE')}`}>
                  KYC : {getStatutLabel(user?.statut_kyc || 'EN_ATTENTE')}
                </span>
              </div>
              <div className="mt-4">
                <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${getStatutColor(user?.conducteur?.statut_regularisation || 'NON_REGULARISE')}`}>
                  {getStatutLabel(user?.conducteur?.statut_regularisation || 'NON_REGULARISE')}
                </span>
              </div>

              {/* Complétude profil */}
              <div className="mt-5 text-left">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Profil complété</span><span>{Math.round(pct)}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div className="h-2 bg-blue-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>

              {/* Infos rapides */}
              <div className="mt-5 space-y-2 text-left">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-lg">⭐</span>
                  <span className="text-gray-600"><strong>{user?.conducteur?.points_fidelite?.toLocaleString('fr-FR') || 0}</strong> points fidélité</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-lg">💰</span>
                  <span className="text-gray-600"><strong>{user?.conducteur?.solde_epargne?.toLocaleString('fr-FR') || 0}</strong> FCFA épargnés</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-lg">🏍️</span>
                  <span className="text-gray-600"><strong>{user?.conducteur?.vehicules?.length || 0}</strong> moto(s) enregistrée(s)</span>
                </div>
              </div>
            </div>

            {/* Formulaire */}
            <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-5">Informations personnelles</h2>
              {msg && <div className={`p-3 rounded-lg text-sm mb-4 ${msg.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{msg}</div>}
              <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Prénom" value={form.prenom} onChange={set('prenom')} />
                  <Input label="Nom" value={form.nom} onChange={set('nom')} />
                </div>
                <Input label="Email" type="email" value={form.email} onChange={set('email')} hint="Optionnel" />
                <Input label="Téléphone" value={user?.telephone || ''} disabled hint="Non modifiable — utilisé comme identifiant" />
                <hr />
                <h3 className="font-medium text-gray-700">Informations conducteur</h3>
                <Input label="Numéro CNI" value={form.numero_cni} onChange={set('numero_cni')} placeholder="1234567890123" />
                <Input label="Adresse" value={form.adresse} onChange={set('adresse')} placeholder="Quartier, Ville" />
                <Input label="Date de naissance" type="date" value={form.date_naissance} onChange={set('date_naissance')} />
                <Button type="submit" loading={loading}>Enregistrer les modifications</Button>
              </form>

              {/* Section KYC */}
              <div className={`mt-6 p-4 rounded-xl border ${user?.statut_kyc === 'VALIDE' ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{user?.statut_kyc === 'VALIDE' ? '✅' : '⚠️'}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{user?.statut_kyc === 'VALIDE' ? 'Identité vérifiée' : 'Vérification d\'identité requise'}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {user?.statut_kyc === 'VALIDE'
                        ? 'Votre identité a été validée. Vous pouvez accéder à tous les services.'
                        : 'Soumettez vos documents d\'identité pour débloquer tous les services.'}
                    </p>
                  </div>
                </div>
                {user?.statut_kyc !== 'VALIDE' && (
                  <button className="mt-3 text-sm text-orange-700 font-medium underline hover:no-underline">
                    Soumettre mes documents →
                  </button>
                )}
              </div>

              {/* Déconnexion — visible sur mobile (sidebar cachée) */}
              <div className="mt-6 lg:hidden">
                <button onClick={logout} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors">
                  🚪 Se déconnecter
                </button>
              </div>
            </div>
          </div>
        </main>
    </AppLayout>
  )
}
