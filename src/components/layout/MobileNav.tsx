'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/dashboard', icon: '🏠', label: 'Accueil' },
  { href: '/dossiers', icon: '📋', label: 'Dossiers' },
  { href: '/assurances', icon: '🛡️', label: 'Assurances' },
  { href: '/finances', icon: '💰', label: 'Finances' },
  { href: '/profil', icon: '👤', label: 'Profil' },
]

export function MobileNav() {
  const path = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-bottom">
      <div className="flex items-stretch h-16">
        {NAV.map(item => {
          const active = path.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex-1 flex flex-col items-center justify-center gap-0.5 text-center transition-colors',
                active ? 'text-[#003366]' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span className={cn('text-[10px] font-medium leading-none', active && 'text-[#003366]')}>
                {item.label}
              </span>
              {active && <span className="absolute bottom-0 w-8 h-0.5 bg-[#003366] rounded-t-full" />}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
