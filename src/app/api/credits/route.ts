import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('jakarta_token')?.value
  const user = token ? await getUserFromToken(token) : null
  if (!user?.conducteur) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const credits = await prisma.microCredit.findMany({
    where: { conducteurId: user.conducteur.id },
    orderBy: { date_demande: 'desc' },
  })
  return NextResponse.json(credits)
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get('jakarta_token')?.value
  const user = token ? await getUserFromToken(token) : null
  if (!user?.conducteur) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { montant, duree_mois, motif } = await req.json()
  if (!montant || montant < 25000 || montant > 500000) {
    return NextResponse.json({ error: 'Montant entre 25 000 et 500 000 FCFA' }, { status: 400 })
  }

  const taux = 5.0
  const r = taux / 100 / 12
  const mensualite = montant * (r * Math.pow(1 + r, duree_mois)) / (Math.pow(1 + r, duree_mois) - 1)

  const credit = await prisma.microCredit.create({
    data: {
      conducteurId: user.conducteur.id,
      montant,
      taux_interet: taux,
      duree_mois,
      mensualite: Math.round(mensualite),
      motif: motif || null,
      statut: 'EN_ATTENTE',
    }
  })

  await prisma.notification.create({
    data: {
      userId: user.id,
      titre: 'Demande de micro-crédit',
      message: `Votre demande de ${montant.toLocaleString('fr-FR')} FCFA a été soumise. Réponse sous 48h.`,
      type: 'INFO',
    }
  })

  return NextResponse.json(credit, { status: 201 })
}
