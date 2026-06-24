import { NextRequest, NextResponse } from 'next/server'

const PUBLIC = ['/', '/login', '/register']
const API_PUBLIC = ['/api/auth']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Routes publiques
  if (PUBLIC.includes(pathname)) return NextResponse.next()
  if (API_PUBLIC.some(p => pathname.startsWith(p))) return NextResponse.next()
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon')) return NextResponse.next()

  // API routes : retourner 401 sans redirect
  if (pathname.startsWith('/api/')) {
    const token = req.cookies.get('jakarta_token')?.value
    if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    return NextResponse.next()
  }

  // Pages protégées : redirect vers /login si pas de token
  const token = req.cookies.get('jakarta_token')?.value
  if (!token) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
