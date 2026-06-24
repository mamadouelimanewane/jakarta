import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('jakarta_token')?.value
  const user = token ? await getUserFromToken(token) : null
  if (!user) return NextResponse.json([])

  const notifs = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })
  return NextResponse.json(notifs)
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get('jakarta_token')?.value
  const user = token ? await getUserFromToken(token) : null
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  await prisma.notification.updateMany({
    where: { userId: user.id, lue: false },
    data: { lue: true },
  })
  return NextResponse.json({ success: true })
}
