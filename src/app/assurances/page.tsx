'use client'
import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Input'
import { useUser } from '@/hooks/useUser'
import { getStatutColor, getStatutLabel, formatMontant, formatDate } from '@/lib/utils'

const TYPE_ICONS: Record<string, string> = {
  RESPONSABILITE_CIVILE: '🛡️',
  TOUS_RISQUES: '🔒',
  ASSURANCE_MALADIE: '🏥',
  RETRAITE: '👴',
}

const TYPE_LABEL: Record<string, string> = {
  RESPONSABILITE_CIVILE: 'Responsabilité Civile',
  TOUS_RISQUES: 'Tous Risques',
  ASSURANCE_MALADIE: 'Assurance Maladie',
  RETRAITE: 'Plan Retraite',
}

export default function AssurancesPage() {
  const { user } = useUser()
  const [assurances, setAssurances] = useState<any[]>([])
  const [offres, setOffres] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [type, setType] = useState('RESPONSABILITE_CIVILE')
  const [paiement, setPaiement] = useState('WAVE')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  async function load() {
    const [a, o] = await Promise.all([fetch('/api/assurances'), fetch('/api/assurances?offres=1')])
    if (a.ok) setAssurances(await a.json())
    if (o.ok) setOffres(await o.json())
  }

  useEffect(() => { load() }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const r = await fetch('/api/assurances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, moyen_paiement: paiement }),
    })
    if (r.ok) { await load(); setShowForm(false); setMsg('Assurance souscrite avec succès ! ✅') }
    else { const d = await r.json(); setMsg(d.error || 'Erreur') }
    setLoading(false)
  }

  const offreSelected = offres.find(o => o.type === type)

  return (
    <AppLayout user={user}>
        <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6 space-y-4 lg:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Assurances & Sécurité Sociale</h1>
              <p className="text-gray-500 mt-1 text-sm">Protégez-vous et votre famille avec nos offres partenaires</p>
            </div>
            <Button onClick={() => { setShowForm(true); setMsg('') }} className="self-start sm:self-auto">+ Souscrire</Button>
          </div>

          {msg && <div className={`p-3 rounded-lg text-sm ${msg.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{msg}</div>}

          {/* Offres disponibles */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Nos offres partenaires</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
              {offres.map(o => (
                <div key={o.type} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 text-center hover:border-blue-300 hover:shadow-md transition-all">
                  <div className="text-3xl mb-2">{TYPE_ICONS[o.type]}</div>
                  <h3 className="font-semibold text-gray-900 text-sm">{TYPE_LABEL[o.type]}</h3>
                  <p className="text-xs text-gray-400 mt-1">{o.compagnie}</p>
                  <p className="text-blue-700 font-bold mt-2">{formatMontant(o.prime_mensuelle)}<span className="text-xs text-gray-400">/mois</span></p>
                  <button onClick={() => { setType(o.type); setShowForm(true) }} className="mt-3 w-full text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium">
                    Souscrire
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Formulaire souscription */}
          {showForm && (
            <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Souscription d&apos;assurance</h2>
              <form onSubmit={submit} className="space-y-4">
                <Select label="Type d'assurance" value={type} onChange={e => setType(e.target.value)}>
                  {offres.map(o => <option key={o.type} value={o.type}>{TYPE_LABEL[o.type]} — {formatMontant(o.prime_mensuelle)}/mois</option>)}
                </Select>
                {offreSelected && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-blue-900">{TYPE_LABEL[offreSelected.type]}</p>
                        <p className="text-sm text-blue-700">{offreSelected.compagnie}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-blue-700">{formatMontant(offreSelected.prime_mensuelle)}</p>
                        <p className="text-xs text-blue-500">par mois</p>
                      </div>
                    </div>
                  </div>
                )}
                <Select label="Moyen de paiement" value={paiement} onChange={e => setPaiement(e.target.value)}>
                  <option value="WAVE">Wave Money</option>
                  <option value="ORANGE_MONEY">Orange Money</option>
                  <option value="FREE_MONEY">Free Money</option>
                </Select>
                <div className="flex gap-3">
                  <Button type="submit" loading={loading}>Confirmer la souscription</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
                </div>
              </form>
            </div>
          )}

          {/* Mes assurances */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Mes polices d&apos;assurance</h2>
            {assurances.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 text-center">
                <div className="text-5xl mb-3">🛡️</div>
                <p className="text-gray-500">Aucune assurance souscrite</p>
                <Button className="mt-4" onClick={() => setShowForm(true)}>Souscrire ma première assurance</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assurances.map(a => {
                  const isExpired = new Date(a.date_fin) < new Date()
                  return (
                    <div key={a.id} className={`bg-white rounded-xl border shadow-sm p-5 ${isExpired ? 'border-red-200' : 'border-gray-200'}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{TYPE_ICONS[a.type]}</span>
                          <div>
                            <h3 className="font-semibold text-gray-900">{TYPE_LABEL[a.type] || a.type}</h3>
                            <p className="text-sm text-gray-400">{a.compagnie}</p>
                          </div>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${isExpired ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {isExpired ? 'Expirée' : 'Active'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><p className="text-gray-400">Police n°</p><p className="font-medium">{a.numero_police}</p></div>
                        <div><p className="text-gray-400">Prime mensuelle</p><p className="font-medium text-blue-700">{formatMontant(a.prime_mensuelle)}</p></div>
                        <div><p className="text-gray-400">Début</p><p className="font-medium">{formatDate(a.date_debut)}</p></div>
                        <div><p className="text-gray-400">Expiration</p><p className={`font-medium ${isExpired ? 'text-red-600' : ''}`}>{formatDate(a.date_fin)}</p></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </main>
    </AppLayout>
  )
}
