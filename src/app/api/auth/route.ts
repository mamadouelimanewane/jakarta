import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword, signToken } from '@/lib/auth'

// POST /api/auth  (login ou register selon action)
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { action } = body

  if (action === 'register') {
    const { telephone, nom, prenom, email, password } = body
    if (!telephone || !nom || !prenom || !password) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }
    const exists = await prisma.user.findUnique({ where: { telephone } })
    if (exists) return NextResponse.json({ error: 'Numéro déjà utilisé' }, { status: 409 })

    const hashed = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        telephone, nom, prenom, email: email || null,
        password: hashed,
        conducteur: { create: {} }
      },
      include: { conducteur: true }
    })

    const token = signToken(user.id)
    const res = NextResponse.json({ success: true, user: sanitize(user) })
    res.cookies.set('jakarta_token', token, { httpOnly: true, maxAge: 604800, path: '/' })
    return res
  }

  if (action === 'login') {
    const { telephone, password } = body
    const user = await prisma.user.findUnique({
      where: { telephone },
      include: { conducteur: true }
    })
    if (!user || !(await verifyPassword(password, user.password))) {
      return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 })
    }
    const token = signToken(user.id)
    const res = NextResponse.json({ success: true, user: sanitize(user) })
    res.cookies.set('jakarta_token', token, { httpOnly: true, maxAge: 604800, path: '/' })
    return res
  }

  if (action === 'logout') {
    const res = NextResponse.json({ success: true })
    res.cookies.delete('jakarta_token')
    return res
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })
}

function sanitize(user: any) {
  const { password, ...rest } = user
  return rest
}
