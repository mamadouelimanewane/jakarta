'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { StatCard } from '@/components/ui/Card'
import { useUser } from '@/hooks/useUser'
import { formatMontant, getStatutColor, getStatutLabel } from '@/lib/utils'

export default function Dashboard() {
  const { user, loading } = useUser()
  const [stats, setStats] = useState<any>(null)
  const [dossiers, setDossiers] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats)
    fetch('/api/dossiers').then(r => r.json()).then(d => Array.isArray(d) && setDossiers(d.slice(0, 3)))
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center"><div className="text-4xl animate-bounce">🏍️</div><p className="text-gray-500 mt-2">Chargement...</p></div>
    </div>
  )

  const pct = stats ? Math.min(100, Math.round(
    ((stats.dossiers_complets > 0 ? 40 : 0) + (stats.assurances_actives > 0 ? 30 : 0) + (stats.statut_regularisation === 'REGULARISE' ? 30 : 0))
  )) : 0

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header user={user} />
        <main className="flex-1 p-6 space-y-6">

          {/* Statut régularisation */}
          <div className="bg-gradient-to-r from-[#003366] to-[#0055a4] rounded-2xl p-6 text-white flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Statut de régularisation</p>
              <h2 className="text-2xl font-bold mt-1">{getStatutLabel(stats?.statut_regularisation || 'NON_REGULARISE')}</h2>
              <p className="text-white/60 text-sm mt-1">Complétez vos démarches pour travailler en toute légalité</p>
            </div>
            <div className="text-right">
              <div className="relative w-24 h-24">
                <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3"/>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#FFD700" strokeWidth="3" strokeDasharray={`${pct}, 100`}/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center"><span className="text-xl font-bold">{pct}%</span></div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={<span className="text-xl">📋</span>} label="Dossiers actifs" value={stats?.dossiers_total ?? 0} sub={`${stats?.dossiers_en_cours ?? 0} en cours`} color="blue" />
            <StatCard icon={<span className="text-xl">🛡️</span>} label="Assurances" value={stats?.assurances_actives ?? 0} sub="polices actives" color="green" />
            <StatCard icon={<span className="text-xl">💰</span>} label="Épargne" value={formatMontant(stats?.solde_epargne ?? 0)} sub="solde disponible" color="orange" />
            <StatCard icon={<span className="text-xl">⭐</span>} label="Points fidélité" value={(stats?.points_fidelite ?? 0).toLocaleString('fr-FR')} sub="points cumulés" color="yellow" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Derniers dossiers */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Mes dossiers</h3>
                <Link href="/dossiers" className="text-sm text-blue-600 hover:underline">Voir tout</Link>
              </div>
              <div className="divide-y divide-gray-50">
                {dossiers.length === 0 ? (
                  <div className="px-6 py-8 text-center">
                    <p className="text-gray-400 text-sm">Aucun dossier soumis</p>
                    <Link href="/dossiers" className="mt-3 inline-block text-sm text-blue-600 font-medium hover:underline">Commencer ma régularisation →</Link>
                  </div>
                ) : dossiers.map(d => (
                  <div key={d.id} className="px-6 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{getStatutLabel(d.type)}</p>
                      <p className="text-xs text-gray-400">{new Date(d.date_soumission).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatutColor(d.statut)}`}>{getStatutLabel(d.statut)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions rapides */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Actions rapides</h3>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3">
                {[
                  { href: '/dossiers', icon: '📋', label: 'Nouveau dossier', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
                  { href: '/assurances', icon: '🛡️', label: 'Souscrire assurance', color: 'bg-green-50 text-green-700 hover:bg-green-100' },
                  { href: '/finances', icon: '💳', label: 'Déposer épargne', color: 'bg-orange-50 text-orange-700 hover:bg-orange-100' },
                  { href: '/formations', icon: '📚', label: 'Suivre formation', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
                  { href: '/finances', icon: '💼', label: 'Demander crédit', color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' },
                  { href: '/fidelite', icon: '⭐', label: 'Mes récompenses', color: 'bg-pink-50 text-pink-700 hover:bg-pink-100' },
                ].map(a => (
                  <Link key={a.href + a.label} href={a.href} className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium transition-colors ${a.color}`}>
                    <span>{a.icon}</span>{a.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Formation en cours */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Formations complétées</p>
              <p className="text-lg font-bold text-gray-900">{stats?.formations_completees ?? 0} / {stats?.formations_total ?? 0}</p>
            </div>
            <div className="flex-1 mx-8">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-2 bg-blue-600 rounded-full transition-all" style={{ width: `${stats?.formations_total ? (stats.formations_completees / stats.formations_total) * 100 : 0}%` }} />
              </div>
            </div>
            <Link href="/formations" className="text-sm text-blue-600 font-medium hover:underline whitespace-nowrap">Continuer →</Link>
          </div>
        </main>
      </div>
    </div>
  )
}
