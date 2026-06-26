'use client'
import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Input'
import { useUser } from '@/hooks/useUser'
import { getStatutColor, getStatutLabel, formatMontant } from '@/lib/utils'

const TYPES = [
  { value: 'IMMATRICULATION', label: 'Immatriculation moto', tarif: 25000 },
  { value: 'PERMIS_CONDUIRE', label: 'Permis de conduire', tarif: 35000 },
  { value: 'RENOUVELLEMENT_PERMIS', label: 'Renouvellement permis', tarif: 15000 },
  { value: 'RENOUVELLEMENT_IMMAT', label: 'Renouvellement immatriculation', tarif: 12000 },
  { value: 'CARTE_GRISE', label: 'Carte grise', tarif: 10000 },
]

const DOCS_REQUIS: Record<string, string[]> = {
  IMMATRICULATION: ['CNI ou Passeport', 'Justificatif de domicile', 'Facture du véhicule'],
  PERMIS_CONDUIRE: ['CNI ou Passeport', 'Certificat médical', '2 photos d\'identité'],
  RENOUVELLEMENT_PERMIS: ['Ancien permis', 'CNI ou Passeport', '2 photos d\'identité'],
  RENOUVELLEMENT_IMMAT: ['Ancienne carte grise', 'Assurance en cours', 'CNI'],
  CARTE_GRISE: ['Facture d\'achat', 'CNI ou Passeport', 'Assurance RC'],
}

const PROGRESSION: Record<string, string[]> = {
  SOUMIS: ['Soumis', 'En cours', 'En attente', 'Approuvé', 'Complété'],
  EN_COURS: ['Soumis', 'En cours', 'En attente', 'Approuvé', 'Complété'],
  EN_ATTENTE_DOCUMENTS: ['Soumis', 'En cours', 'En attente', 'Approuvé', 'Complété'],
  APPROUVE: ['Soumis', 'En cours', 'En attente', 'Approuvé', 'Complété'],
  COMPLETE: ['Soumis', 'En cours', 'En attente', 'Approuvé', 'Complété'],
}

const STEP_IDX: Record<string, number> = { SOUMIS: 0, EN_COURS: 1, EN_ATTENTE_DOCUMENTS: 2, APPROUVE: 3, COMPLETE: 4 }

export default function DossiersPage() {
  const { user } = useUser()
  const [dossiers, setDossiers] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [type, setType] = useState('IMMATRICULATION')
  const [paiement, setPaiement] = useState('WAVE')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  async function load() {
    const r = await fetch('/api/dossiers')
    if (r.ok) setDossiers(await r.json())
  }

  useEffect(() => { load() }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const r = await fetch('/api/dossiers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, moyen_paiement: paiement }),
    })
    if (r.ok) { await load(); setShowForm(false); setMsg('Dossier soumis avec succès ! ✅') }
    else { const d = await r.json(); setMsg(d.error || 'Erreur') }
    setLoading(false)
  }

  const typeInfo = TYPES.find(t => t.value === type)

  return (
    <AppLayout user={user}>
        <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6 space-y-4 lg:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Régularisation Administrative</h1>
              <p className="text-gray-500 mt-1 text-sm">Gérez vos dossiers administratifs en ligne</p>
            </div>
            <Button onClick={() => { setShowForm(true); setMsg('') }} className="self-start sm:self-auto">+ Nouveau dossier</Button>
          </div>

          {msg && <div className={`p-3 rounded-lg text-sm ${msg.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{msg}</div>}

          {/* Formulaire */}
          {showForm && (
            <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Nouveau dossier de régularisation</h2>
              <form onSubmit={submit} className="space-y-4">
                <Select label="Type de dossier" value={type} onChange={e => setType(e.target.value)}>
                  {TYPES.map(t => <option key={t.value} value={t.value}>{t.label} — {formatMontant(t.tarif)}</option>)}
                </Select>

                {/* Documents requis */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-800 mb-2">📎 Documents requis</p>
                  <ul className="space-y-1">
                    {(DOCS_REQUIS[type] || []).map(d => (
                      <li key={d} className="text-sm text-blue-700 flex items-center gap-2"><span>✓</span>{d}</li>
                    ))}
                  </ul>
                </div>

                <Select label="Moyen de paiement" value={paiement} onChange={e => setPaiement(e.target.value)}>
                  <option value="WAVE">Wave Money</option>
                  <option value="ORANGE_MONEY">Orange Money</option>
                  <option value="FREE_MONEY">Free Money</option>
                  <option value="ESPECES">Espèces (agence)</option>
                </Select>

                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                  <span className="text-sm text-gray-600">Montant à payer</span>
                  <span className="text-xl font-bold text-blue-700">{formatMontant(typeInfo?.tarif || 0)}</span>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" loading={loading}>Soumettre et payer</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
                </div>
              </form>
            </div>
          )}

          {/* Liste dossiers */}
          <div className="space-y-4">
            {dossiers.length === 0 && !showForm && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                <div className="text-5xl mb-4">📋</div>
                <h3 className="text-lg font-semibold text-gray-900">Aucun dossier</h3>
                <p className="text-gray-500 mt-2">Soumettez votre premier dossier de régularisation</p>
                <Button className="mt-4" onClick={() => setShowForm(true)}>Commencer ma régularisation</Button>
              </div>
            )}

            {dossiers.map(d => {
              const step = STEP_IDX[d.statut] ?? 0
              const steps = PROGRESSION[d.statut] || PROGRESSION.SOUMIS
              return (
                <div key={d.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{getStatutLabel(d.type)}</h3>
                      <p className="text-sm text-gray-400 mt-0.5">Soumis le {new Date(d.date_soumission).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatutColor(d.statut)}`}>{getStatutLabel(d.statut)}</span>
                  </div>

                  {/* Barre de progression */}
                  <div className="flex items-center gap-0 mb-4">
                    {steps.map((s, i) => (
                      <div key={s} className="flex items-center flex-1">
                        <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${i <= step ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400'}`}>
                          {i < step ? '✓' : i + 1}
                        </div>
                        {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-blue-600' : 'bg-gray-200'}`} />}
                      </div>
                    ))}
                  </div>
                  <div className="hidden sm:flex justify-between text-xs text-gray-400 mb-4">
                    {steps.map(s => <span key={s}>{s}</span>)}
                  </div>

                  {d.montant_paye > 0 && (
                    <div className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-4 py-2">
                      <span className="text-gray-500">Montant payé</span>
                      <span className="font-semibold text-gray-900">{formatMontant(d.montant_paye)}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </main>
    </AppLayout>
  )
}
