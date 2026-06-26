'use client'
import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { useUser } from '@/hooks/useUser'
import { formatMontant } from '@/lib/utils'

const RECOMPENSES = [
  { points: 500, label: 'Réduction 10% sur prochain dossier', icon: '📋', valeur: '2 500 FCFA' },
  { points: 1000, label: 'Un mois d\'assurance offert', icon: '🛡️', valeur: '8 500 FCFA' },
  { points: 2000, label: 'Formation premium offerte', icon: '📚', valeur: '15 000 FCFA' },
  { points: 3000, label: 'Réduction 20% sur micro-crédit', icon: '💰', valeur: '20 000 FCFA' },
  { points: 5000, label: 'Kit équipement sécurité', icon: '⛑️', valeur: '35 000 FCFA' },
]

const ACTIONS_POINTS = [
  { action: 'Inscription sur la plateforme', points: 200, icon: '👤' },
  { action: 'Dossier administratif soumis', points: 100, icon: '📋' },
  { action: 'Assurance souscrite', points: 200, icon: '🛡️' },
  { action: 'Formation complétée', points: 300, icon: '📚' },
  { action: 'Dépôt d\'épargne (par tranche 1000 FCFA)', points: 10, icon: '💰' },
  { action: 'Parrainage d\'un conducteur', points: 500, icon: '👥' },
]

export default function FidelitePage() {
  const { user } = useUser()
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats)
  }, [])

  const points = stats?.points_fidelite ?? 0
  const niveau = points >= 5000 ? 'Or' : points >= 2000 ? 'Argent' : 'Bronze'
  const niveauColor = { Or: 'text-yellow-500', Argent: 'text-gray-400', Bronze: 'text-orange-700' }[niveau] || ''
  const niveauBg = { Or: 'from-yellow-400 to-orange-400', Argent: 'from-gray-300 to-gray-400', Bronze: 'from-orange-400 to-orange-600' }[niveau] || ''
  const prochainNiveau = niveau === 'Bronze' ? 2000 : niveau === 'Argent' ? 5000 : 10000
  const pct = Math.min(100, Math.round((points / prochainNiveau) * 100))

  return (
    <AppLayout user={user}>
        <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6 space-y-4 lg:space-y-6">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Programme de Fidélité</h1>
            <p className="text-gray-500 mt-1 text-sm">Gagnez des points et débloquez des récompenses exclusives</p>
          </div>

          {/* Carte fidélité */}
          <div className={`bg-gradient-to-r ${niveauBg} rounded-2xl p-5 lg:p-6 text-white`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/80 text-sm">Membre Jakarta</p>
                <h2 className="text-3xl font-extrabold mt-1">{points.toLocaleString('fr-FR')} pts</h2>
                <p className="text-white/80 mt-1">Niveau <strong>{niveau}</strong></p>
              </div>
              <div className="text-5xl">{niveau === 'Or' ? '🥇' : niveau === 'Argent' ? '🥈' : '🥉'}</div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-white/70 mb-1">
                <span>{points.toLocaleString('fr-FR')} pts</span>
                <span>{prochainNiveau.toLocaleString('fr-FR')} pts (niveau suivant)</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full">
                <div className="h-2 bg-white rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <p className="text-xs text-white/60 mt-2">Il vous manque <strong>{(prochainNiveau - points).toLocaleString('fr-FR')} points</strong> pour atteindre le niveau suivant</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Comment gagner des points */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Comment gagner des points ?</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {ACTIONS_POINTS.map(a => (
                  <div key={a.action} className="px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{a.icon}</span>
                      <span className="text-sm text-gray-700">{a.action}</span>
                    </div>
                    <span className="text-sm font-bold text-yellow-600">+{a.points} pts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Catalogue récompenses */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Catalogue des récompenses</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {RECOMPENSES.map(r => {
                  const canRedeem = points >= r.points
                  return (
                    <div key={r.label} className={`px-6 py-4 flex items-center justify-between ${!canRedeem ? 'opacity-50' : ''}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{r.icon}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{r.label}</p>
                          <p className="text-xs text-gray-400">Valeur : {r.valeur}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-orange-600">{r.points.toLocaleString('fr-FR')} pts</p>
                        <button disabled={!canRedeem} className={`mt-1 text-xs px-3 py-1 rounded-full font-medium transition-colors ${canRedeem ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                          {canRedeem ? 'Échanger' : 'Insuffisant'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Niveaux */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Les niveaux du programme</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
              {[
                { n: 'Bronze', pts: '0 - 1 999', icon: '🥉', avantage: 'Accès aux récompenses de base' },
                { n: 'Argent', pts: '2 000 - 4 999', icon: '🥈', avantage: 'Réductions exclusives + priorité support' },
                { n: 'Or', pts: '5 000+', icon: '🥇', avantage: 'Tous avantages + accès offres premium' },
              ].map(l => (
                <div key={l.n} className={`p-4 rounded-xl border-2 text-center ${niveau === l.n ? 'border-yellow-400 bg-yellow-50' : 'border-gray-100'}`}>
                  <div className="text-3xl mb-2">{l.icon}</div>
                  <h3 className="font-bold text-gray-900">{l.n}</h3>
                  <p className="text-xs text-gray-500 mt-1">{l.pts} pts</p>
                  <p className="text-xs text-gray-600 mt-2">{l.avantage}</p>
                  {niveau === l.n && <span className="inline-block mt-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full font-medium">Votre niveau</span>}
                </div>
              ))}
            </div>
          </div>
        </main>
    </AppLayout>
  )
}
