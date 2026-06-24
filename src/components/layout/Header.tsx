'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Notif { id: string; titre: string; message: string; type: string; lue: boolean; createdAt: string }

export function Header({ user }: { user: any }) {
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [open, setOpen] = useState(false)
  const unread = notifs.filter(n => !n.lue).length

  useEffect(() => {
    fetch('/api/notifications').then(r => r.json()).then(d => Array.isArray(d) && setNotifs(d))
  }, [])

  async function markRead() {
    if (unread > 0) {
      await fetch('/api/notifications', { method: 'PATCH' })
      setNotifs(n => n.map(x => ({ ...x, lue: true })))
    }
    setOpen(o => !o)
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Bonjour, {user?.prenom} 👋
        </h2>
        <p className="text-xs text-gray-500">Bienvenue sur votre espace Jakarta</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <button onClick={markRead} className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <span className="text-xl">🔔</span>
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="font-semibold text-gray-900 text-sm">Notifications</span>
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                {notifs.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-gray-400">Aucune notification</p>
                ) : notifs.map(n => (
                  <div key={n.id} className={`px-4 py-3 ${!n.lue ? 'bg-blue-50' : ''}`}>
                    <p className="text-sm font-medium text-gray-900">{n.titre}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <Link href="/profil" className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {user?.prenom?.[0]}{user?.nom?.[0]}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{user?.prenom} {user?.nom}</p>
            <p className="text-xs text-gray-400">{user?.telephone}</p>
          </div>
        </Link>
      </div>
    </header>
  )
}
