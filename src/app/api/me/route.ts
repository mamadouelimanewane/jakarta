import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('jakarta_token')?.value
  if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const user = await getUserFromToken(token)
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { password, ...rest } = user as any
  return NextResponse.json(rest)
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get('jakarta_token')?.value
  if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const user = await getUserFromToken(token)
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()
  const { prisma } = await import('@/lib/prisma')

  await prisma.user.update({
    where: { id: user.id },
    data: {
      nom: body.nom ?? user.nom,
      prenom: body.prenom ?? user.prenom,
      email: body.email ?? user.email,
    }
  })

  if (user.conducteur && (body.adresse || body.date_naissance || body.numero_cni)) {
    await prisma.conducteur.update({
      where: { id: user.conducteur.id },
      data: {
        adresse: body.adresse ?? user.conducteur.adresse,
        date_naissance: body.date_naissance ?? user.conducteur.date_naissance,
        numero_cni: body.numero_cni ?? user.conducteur.numero_cni,
      }
    })
  }

  return NextResponse.json({ success: true })
}
