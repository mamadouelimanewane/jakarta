'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/dashboard', icon: '🏠', label: 'Tableau de bord' },
  { href: '/dossiers', icon: '📋', label: 'Régularisation' },
  { href: '/assurances', icon: '🛡️', label: 'Assurances' },
  { href: '/finances', icon: '💰', label: 'Finances' },
  { href: '/formations', icon: '📚', label: 'Formations' },
  { href: '/fidelite', icon: '⭐', label: 'Fidélité' },
  { href: '/profil', icon: '👤', label: 'Mon Profil' },
]

export function Sidebar() {
  const path = usePathname()
  const router = useRouter()

  async function logout() {
    await fetch('/api/auth', { method: 'POST', body: JSON.stringify({ action: 'logout' }), headers: { 'Content-Type': 'application/json' } })
    router.push('/login')
  }

  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-[#003366] to-[#0055a4] flex flex-col shadow-xl">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-2xl">🏍️</div>
          <div>
            <h1 className="text-white font-bold text-xl leading-none">J@KARTA</h1>
            <p className="text-white/60 text-xs mt-0.5">Connect & Care</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
              path.startsWith(item.href)
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            )}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all"
        >
          <span>🚪</span> Déconnexion
        </button>
      </div>
    </aside>
  )
}
