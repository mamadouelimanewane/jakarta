import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const TARIFS: Record<string, number> = {
  IMMATRICULATION: 25000,
  PERMIS_CONDUIRE: 35000,
  RENOUVELLEMENT_PERMIS: 15000,
  RENOUVELLEMENT_IMMAT: 12000,
  CARTE_GRISE: 10000,
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get('jakarta_token')?.value
  const user = token ? await getUserFromToken(token) : null
  if (!user?.conducteur) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const dossiers = await prisma.dossier.findMany({
    where: { conducteurId: user.conducteur.id },
    include: { documents: true },
    orderBy: { date_soumission: 'desc' },
  })
  return NextResponse.json(dossiers)
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get('jakarta_token')?.value
  const user = token ? await getUserFromToken(token) : null
  if (!user?.conducteur) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()
  const { type, moyen_paiement } = body

  if (!type || !TARIFS[type]) {
    return NextResponse.json({ error: 'Type de dossier invalide' }, { status: 400 })
  }

  const montant = TARIFS[type]

  const dossier = await prisma.dossier.create({
    data: {
      conducteurId: user.conducteur.id,
      type,
      statut: moyen_paiement ? 'EN_COURS' : 'SOUMIS',
      montant_paye: moyen_paiement ? montant : 0,
      moyen_paiement: moyen_paiement || null,
    }
  })

  if (moyen_paiement) {
    await prisma.transaction.create({
      data: {
        conducteurId: user.conducteur.id,
        type: 'PAIEMENT_DOSSIER',
        montant,
        moyen_paiement,
        description: `Paiement dossier ${type}`,
      }
    })
    // Mise à jour points fidélité
    await prisma.conducteur.update({
      where: { id: user.conducteur.id },
      data: { points_fidelite: { increment: 100 } }
    })
  }

  // Notification
  await prisma.notification.create({
    data: {
      userId: user.id,
      titre: 'Dossier soumis',
      message: `Votre dossier ${type.replace('_', ' ')} a bien été soumis et est en cours de traitement.`,
      type: 'SUCCESS',
    }
  })

  return NextResponse.json(dossier, { status: 201 })
}
