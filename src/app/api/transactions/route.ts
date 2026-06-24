import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('jakarta_token')?.value
  const user = token ? await getUserFromToken(token) : null
  if (!user?.conducteur) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const transactions = await prisma.transaction.findMany({
    where: { conducteurId: user.conducteur.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  return NextResponse.json(transactions)
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get('jakarta_token')?.value
  const user = token ? await getUserFromToken(token) : null
  if (!user?.conducteur) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { type, montant, moyen_paiement, description } = await req.json()
  if (!montant || montant <= 0) return NextResponse.json({ error: 'Montant invalide' }, { status: 400 })

  const conducteur = await prisma.conducteur.findUnique({ where: { id: user.conducteur.id } })
  if (!conducteur) return NextResponse.json({ error: 'Conducteur introuvable' }, { status: 404 })

  if (type === 'EPARGNE_RETRAIT' && conducteur.solde_epargne < montant) {
    return NextResponse.json({ error: 'Solde insuffisant' }, { status: 400 })
  }

  const delta = type === 'EPARGNE_DEPOT' ? montant : type === 'EPARGNE_RETRAIT' ? -montant : 0

  const [tx] = await prisma.$transaction([
    prisma.transaction.create({
      data: { conducteurId: user.conducteur.id, type, montant, moyen_paiement, description: description || null }
    }),
    prisma.conducteur.update({
      where: { id: user.conducteur.id },
      data: {
        solde_epargne: { increment: delta },
        points_fidelite: type === 'EPARGNE_DEPOT' ? { increment: Math.floor(montant / 1000) * 10 } : undefined,
      }
    }),
  ])

  return NextResponse.json(tx, { status: 201 })
}
