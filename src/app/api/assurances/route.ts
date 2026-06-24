import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const OFFRES = [
  { type: 'RESPONSABILITE_CIVILE', label: 'Responsabilité Civile', compagnie: 'NSIA Assurances', prime_mensuelle: 8500 },
  { type: 'TOUS_RISQUES', label: 'Tous Risques', compagnie: 'Allianz Sénégal', prime_mensuelle: 18000 },
  { type: 'ASSURANCE_MALADIE', label: 'Assurance Maladie', compagnie: 'AXA Assurances', prime_mensuelle: 5000 },
  { type: 'RETRAITE', label: 'Plan Retraite', compagnie: 'Caisse Retraite SN', prime_mensuelle: 3000 },
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('offres') === '1') {
    return NextResponse.json(OFFRES)
  }

  const token = req.cookies.get('jakarta_token')?.value
  const user = token ? await getUserFromToken(token) : null
  if (!user?.conducteur) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const assurances = await prisma.assurance.findMany({
    where: { conducteurId: user.conducteur.id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(assurances)
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get('jakarta_token')?.value
  const user = token ? await getUserFromToken(token) : null
  if (!user?.conducteur) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()
  const { type, moyen_paiement } = body

  const offre = OFFRES.find(o => o.type === type)
  if (!offre) return NextResponse.json({ error: 'Offre invalide' }, { status: 400 })

  const date_debut = new Date()
  const date_fin = new Date()
  date_fin.setFullYear(date_fin.getFullYear() + 1)

  const police = `POL-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`

  const [assurance] = await prisma.$transaction([
    prisma.assurance.create({
      data: {
        conducteurId: user.conducteur.id,
        type,
        compagnie: offre.compagnie,
        numero_police: police,
        prime_mensuelle: offre.prime_mensuelle,
        date_debut,
        date_fin,
        statut: 'ACTIVE',
      }
    }),
    prisma.transaction.create({
      data: {
        conducteurId: user.conducteur.id,
        type: 'PAIEMENT_ASSURANCE',
        montant: offre.prime_mensuelle,
        moyen_paiement: moyen_paiement || 'WAVE',
        description: `Première prime ${offre.label}`,
      }
    }),
    prisma.conducteur.update({
      where: { id: user.conducteur.id },
      data: { points_fidelite: { increment: 200 } }
    }),
    prisma.notification.create({
      data: {
        userId: user.id,
        titre: 'Assurance souscrite',
        message: `Votre ${offre.label} avec ${offre.compagnie} est active. Police n° ${police}`,
        type: 'SUCCESS',
      }
    }),
  ])

  return NextResponse.json(assurance, { status: 201 })
}
