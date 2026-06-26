import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('jakarta_token')?.value
  const user = token ? await getUserFromToken(token) : null

  const formations = await prisma.formation.findMany({
    where: { actif: true },
    orderBy: { createdAt: 'asc' },
  })

  if (!user?.conducteur) return NextResponse.json(formations.map(f => ({ ...f, progression: null })))

  const progressions = await prisma.progression.findMany({
    where: { conducteurId: user.conducteur.id },
  })

  const result = formations.map(f => ({
    ...f,
    progression: progressions.find(p => p.formationId === f.id) || null,
  }))

  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get('jakarta_token')?.value
  const user = token ? await getUserFromToken(token) : null
  if (!user?.conducteur) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { formationId, pourcentage } = await req.json()

  const formation = await prisma.formation.findUnique({ where: { id: formationId } })
  if (!formation) return NextResponse.json({ error: 'Formation introuvable' }, { status: 404 })

  const completee = pourcentage >= 100
  const prog = await prisma.progression.upsert({
    where: { conducteurId_formationId: { conducteurId: user.conducteur.id, formationId } },
    update: {
      pourcentage: Math.min(100, pourcentage),
      completee,
      date_completion: completee ? new Date() : null,
    },
    create: {
      conducteurId: user.conducteur.id,
      formationId,
      pourcentage: Math.min(100, pourcentage),
      completee,
      date_completion: completee ? new Date() : null,
    }
  })

  if (completee) {
    await prisma.$transaction([
      prisma.conducteur.update({
        where: { id: user.conducteur.id },
        data: { points_fidelite: { increment: 300 } }
      }),
      prisma.notification.create({
        data: {
          userId: user.id,
          titre: '🏆 Formation complétée !',
          message: `Félicitations ! Vous avez terminé "${formation.titre}". +300 points fidélité.`,
          type: 'SUCCESS',
        }
      }),
    ])
  }

  return NextResponse.json(prog)
}
