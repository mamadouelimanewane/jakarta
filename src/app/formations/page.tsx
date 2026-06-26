'use client'
import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { useUser } from '@/hooks/useUser'

const CAT_ICONS: Record<string, string> = {
  SECURITE: '⛑️', CODE_ROUTE: '🚦', FINANCE: '💰', SERVICE: '🤝', MECANIQUE: '🔧',
}

export default function FormationsPage() {
  const { user } = useUser()
  const [formations, setFormations] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState<string | null>(null)

  async function load() {
    const r = await fetch('/api/formations')
    if (r.ok) setFormations(await r.json())
  }

  useEffect(() => { load() }, [])

  async function progresser(formationId: string, current: number, increment = 25) {
    setLoading(true)
    const nouv = Math.min(100, current + increment)
    await fetch('/api/formations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formationId, pourcentage: nouv }),
    })
    await load()
    setLoading(false)
  }

  const completees = formations.filter(f => f.progression?.completee).length
  const enCours = formations.filter(f => f.progression && !f.progression.completee).length

  return (
    <AppLayout user={user}>
        <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6 space-y-4 lg:space-y-6">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Formations & Éducation</h1>
            <p className="text-gray-500 mt-1 text-sm">Améliorez vos compétences et gagnez des points fidélité</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 lg:gap-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 text-center">
              <p className="text-3xl font-bold text-blue-600">{formations.length}</p>
              <p className="text-sm text-gray-500 mt-1">Formations disponibles</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 text-center">
              <p className="text-3xl font-bold text-emerald-600">{completees}</p>
              <p className="text-sm text-gray-500 mt-1">Formations complétées</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 text-center">
              <p className="text-3xl font-bold text-orange-500">{enCours}</p>
              <p className="text-sm text-gray-500 mt-1">En cours</p>
            </div>
          </div>

          {/* Info points */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
            <span className="text-2xl">⭐</span>
            <div>
              <p className="text-sm font-semibold text-yellow-800">Gagnez des points fidélité</p>
              <p className="text-xs text-yellow-700 mt-0.5">Chaque formation complétée vous rapporte <strong>+300 points</strong> fidélité échangeables contre des récompenses.</p>
            </div>
          </div>

          {/* Liste formations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formations.map(f => {
              const pct = f.progression?.pourcentage ?? 0
              const done = f.progression?.completee ?? false
              const isActive = active === f.id
              return (
                <div key={f.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${done ? 'border-emerald-200' : 'border-gray-200'}`}>
                  {/* Header */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${done ? 'bg-emerald-50' : 'bg-blue-50'}`}>
                          {CAT_ICONS[f.categorie] || '📚'}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm">{f.titre}</h3>
                          <p className="text-xs text-gray-400 mt-0.5">{f.duree_minutes} min · {f.niveau} · 🇫🇷 FR</p>
                        </div>
                      </div>
                      {done && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">✅ Certifié</span>}
                    </div>
                    <p className="text-xs text-gray-500 mb-3">{f.description}</p>

                    {/* Barre progression */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Progression</span><span>{pct}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-2 rounded-full transition-all ${done ? 'bg-emerald-500' : 'bg-blue-600'}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      {!done && (
                        <Button
                          size="sm"
                          onClick={() => progresser(f.id, pct)}
                          loading={loading && isActive}
                          onMouseDown={() => setActive(f.id)}
                        >
                          {pct === 0 ? '▶ Commencer' : '▶ Continuer'}
                        </Button>
                      )}
                      {done && <Button size="sm" variant="outline">📥 Télécharger certificat</Button>}
                      {pct > 0 && !done && (
                        <Button size="sm" variant="outline" onClick={() => progresser(f.id, pct, 100 - pct)}>
                          Terminer
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Simulation de leçon */}
                  {isActive && pct > 0 && !done && (
                    <div className="border-t border-blue-100 bg-blue-50 p-4">
                      <p className="text-sm text-blue-800 font-medium">📖 Module en cours...</p>
                      <p className="text-xs text-blue-600 mt-1">Cliquez sur &quot;Continuer&quot; pour progresser dans la formation.</p>
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
