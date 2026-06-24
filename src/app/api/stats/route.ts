import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('jakarta_token')?.value
  const user = token ? await getUserFromToken(token) : null
  if (!user?.conducteur) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const cid = user.conducteur.id

  const [dossiers, assurances, formations, credits, conducteur] = await Promise.all([
    prisma.dossier.findMany({ where: { conducteurId: cid } }),
    prisma.assurance.findMany({ where: { conducteurId: cid, statut: 'ACTIVE' } }),
    prisma.progression.findMany({ where: { conducteurId: cid } }),
    prisma.microCredit.findMany({ where: { conducteurId: cid } }),
    prisma.conducteur.findUnique({ where: { id: cid } }),
  ])

  const txMonths = await prisma.transaction.groupBy({
    by: ['createdAt'],
    where: { conducteurId: cid, type: { in: ['EPARGNE_DEPOT', 'EPARGNE_RETRAIT'] } },
    _sum: { montant: true },
  })

  return NextResponse.json({
    dossiers_total: dossiers.length,
    dossiers_en_cours: dossiers.filter(d => d.statut === 'EN_COURS').length,
    dossiers_complets: dossiers.filter(d => d.statut === 'COMPLETE' || d.statut === 'APPROUVE').length,
    assurances_actives: assurances.length,
    formations_completees: formations.filter(f => f.completee).length,
    formations_total: formations.length,
    credits_actifs: credits.filter(c => c.statut === 'APPROUVE').length,
    solde_epargne: conducteur?.solde_epargne ?? 0,
    points_fidelite: conducteur?.points_fidelite ?? 0,
    statut_regularisation: conducteur?.statut_regularisation ?? 'NON_REGULARISE',
  })
}
