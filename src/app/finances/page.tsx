'use client'
import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { StatCard } from '@/components/ui/Card'
import { useUser } from '@/hooks/useUser'
import { formatMontant, formatDate, calcMensualite } from '@/lib/utils'

const TX_ICONS: Record<string, string> = {
  EPARGNE_DEPOT: '⬆️', EPARGNE_RETRAIT: '⬇️', PAIEMENT_DOSSIER: '📋',
  PAIEMENT_ASSURANCE: '🛡️', REMBOURSEMENT_CREDIT: '💳', RECOMPENSE: '⭐',
}
const TX_COLORS: Record<string, string> = {
  EPARGNE_DEPOT: 'text-green-600', EPARGNE_RETRAIT: 'text-red-600',
  PAIEMENT_DOSSIER: 'text-orange-600', PAIEMENT_ASSURANCE: 'text-purple-600',
  REMBOURSEMENT_CREDIT: 'text-red-600', RECOMPENSE: 'text-yellow-600',
}

export default function FinancesPage() {
  const { user } = useUser()
  const [transactions, setTransactions] = useState<any[]>([])
  const [credits, setCredits] = useState<any[]>([])
  const [solde, setSolde] = useState(0)
  const [tab, setTab] = useState<'epargne' | 'credit'>('epargne')
  const [mode, setMode] = useState<'depot' | 'retrait'>('depot')
  const [montant, setMontant] = useState('')
  const [paiement, setPaiement] = useState('WAVE')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  // Crédit form
  const [creditForm, setCreditForm] = useState({ montant: '', duree_mois: '6', motif: '' })
  const [creditLoading, setCreditLoading] = useState(false)
  const mensualite = creditForm.montant ? calcMensualite(+creditForm.montant, 5, +creditForm.duree_mois) : 0

  async function loadData() {
    const [tx, cr, me] = await Promise.all([
      fetch('/api/transactions').then(r => r.json()),
      fetch('/api/credits').then(r => r.json()),
      fetch('/api/me').then(r => r.json()),
    ])
    if (Array.isArray(tx)) setTransactions(tx)
    if (Array.isArray(cr)) setCredits(cr)
    if (me?.conducteur) setSolde(me.conducteur.solde_epargne ?? 0)
  }

  useEffect(() => { loadData() }, [])

  async function submitEpargne(e: React.FormEvent) {
    e.preventDefault()
    if (!montant || +montant <= 0) return
    setLoading(true); setMsg('')
    const r = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: mode === 'depot' ? 'EPARGNE_DEPOT' : 'EPARGNE_RETRAIT', montant: +montant, moyen_paiement: paiement }),
    })
    if (r.ok) { await loadData(); setMontant(''); setMsg(`${mode === 'depot' ? 'Dépôt' : 'Retrait'} effectué avec succès ✅`) }
    else { const d = await r.json(); setMsg(d.error || 'Erreur') }
    setLoading(false)
  }

  async function submitCredit(e: React.FormEvent) {
    e.preventDefault()
    setCreditLoading(true); setMsg('')
    const r = await fetch('/api/credits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ montant: +creditForm.montant, duree_mois: +creditForm.duree_mois, motif: creditForm.motif }),
    })
    if (r.ok) { await loadData(); setCreditForm({ montant: '', duree_mois: '6', motif: '' }); setMsg('Demande de crédit soumise ! Réponse sous 48h ✅') }
    else { const d = await r.json(); setMsg(d.error || 'Erreur') }
    setCreditLoading(false)
  }

  const totalDepose = transactions.filter(t => t.type === 'EPARGNE_DEPOT').reduce((s, t) => s + t.montant, 0)

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header user={user} />
        <main className="flex-1 p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Finances</h1>
            <p className="text-gray-500 mt-1">Gérez votre épargne et vos micro-crédits</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard icon={<span className="text-xl">💰</span>} label="Solde épargne" value={formatMontant(solde)} sub="disponible maintenant" color="green" />
            <StatCard icon={<span className="text-xl">📈</span>} label="Total déposé" value={formatMontant(totalDepose)} sub="depuis l'ouverture" color="blue" />
            <StatCard icon={<span className="text-xl">💼</span>} label="Crédits actifs" value={credits.filter(c => c.statut === 'APPROUVE').length} sub="en cours" color="orange" />
          </div>

          {msg && <div className={`p-3 rounded-lg text-sm ${msg.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{msg}</div>}

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            {(['epargne', 'credit'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                {t === 'epargne' ? '💰 Épargne' : '💼 Micro-Crédit'}
              </button>
            ))}
          </div>

          {tab === 'epargne' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Formulaire épargne */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Opération sur mon épargne</h2>
                <div className="flex gap-2 mb-4">
                  {([['depot', 'Dépôt ⬆️'], ['retrait', 'Retrait ⬇️']] as const).map(([v, l]) => (
                    <button key={v} onClick={() => setMode(v)} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${mode === v ? (v === 'depot' ? 'bg-green-600 text-white' : 'bg-red-600 text-white') : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{l}</button>
                  ))}
                </div>
                <form onSubmit={submitEpargne} className="space-y-4">
                  <Input label="Montant (FCFA)" type="number" min="500" step="500" placeholder="Ex: 10000" value={montant} onChange={e => setMontant(e.target.value)} />
                  <Select label="Moyen" value={paiement} onChange={e => setPaiement(e.target.value)}>
                    <option value="WAVE">Wave Money</option>
                    <option value="ORANGE_MONEY">Orange Money</option>
                    <option value="FREE_MONEY">Free Money</option>
                  </Select>
                  <Button type="submit" loading={loading} className="w-full" variant={mode === 'depot' ? 'secondary' : 'danger'}>
                    {mode === 'depot' ? 'Effectuer le dépôt' : 'Effectuer le retrait'}
                  </Button>
                </form>
              </div>

              {/* Transactions */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900">Historique des transactions</h2>
                </div>
                <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                  {transactions.length === 0 ? (
                    <p className="px-6 py-8 text-center text-sm text-gray-400">Aucune transaction</p>
                  ) : transactions.map(t => (
                    <div key={t.id} className="px-6 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{TX_ICONS[t.type]}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{t.description || t.type.replace('_', ' ')}</p>
                          <p className="text-xs text-gray-400">{formatDate(t.createdAt)} · {t.moyen_paiement}</p>
                        </div>
                      </div>
                      <span className={`text-sm font-bold ${TX_COLORS[t.type]}`}>
                        {['EPARGNE_DEPOT', 'RECOMPENSE'].includes(t.type) ? '+' : '-'}{formatMontant(t.montant)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'credit' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Formulaire crédit */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Demander un micro-crédit</h2>
                <p className="text-sm text-gray-500 mb-4">25 000 à 500 000 FCFA · Taux 5% · Réponse sous 48h</p>
                <form onSubmit={submitCredit} className="space-y-4">
                  <Input label="Montant (FCFA)" type="number" min="25000" max="500000" step="5000" placeholder="Ex: 100000"
                    value={creditForm.montant} onChange={e => setCreditForm(f => ({ ...f, montant: e.target.value }))} />
                  <Select label="Durée" value={creditForm.duree_mois} onChange={e => setCreditForm(f => ({ ...f, duree_mois: e.target.value }))}>
                    {[3, 6, 9, 12].map(d => <option key={d} value={d}>{d} mois</option>)}
                  </Select>
                  <Input label="Motif (optionnel)" placeholder="Réparation moto, achat équipement..." value={creditForm.motif} onChange={e => setCreditForm(f => ({ ...f, motif: e.target.value }))} />
                  {creditForm.montant && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-700">Mensualité estimée</span>
                        <span className="font-bold text-blue-900">{formatMontant(Math.round(mensualite))}/mois</span>
                      </div>
                      <div className="flex justify-between text-xs text-blue-600 mt-1">
                        <span>Taux d&apos;intérêt annuel</span><span>5%</span>
                      </div>
                    </div>
                  )}
                  <Button type="submit" loading={creditLoading} className="w-full">Soumettre ma demande</Button>
                </form>
              </div>

              {/* Mes crédits */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100"><h2 className="font-semibold text-gray-900">Mes crédits</h2></div>
                <div className="divide-y divide-gray-50">
                  {credits.length === 0 ? (
                    <p className="px-6 py-8 text-center text-sm text-gray-400">Aucun crédit demandé</p>
                  ) : credits.map(c => (
                    <div key={c.id} className="px-6 py-4">
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold text-gray-900">{formatMontant(c.montant)}</span>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${c.statut === 'APPROUVE' ? 'bg-green-100 text-green-700' : c.statut === 'REJETE' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{c.statut}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                        <span>Durée : {c.duree_mois} mois</span>
                        <span>Mensualité : {formatMontant(Math.round(c.mensualite))}</span>
                        <span>Demandé le {formatDate(c.date_demande)}</span>
                        <span>Taux : {c.taux_interet}%</span>
                      </div>
                      {c.motif && <p className="text-xs text-gray-400 mt-1">Motif : {c.motif}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
