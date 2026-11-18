import { prisma } from '@/lib/prisma'
export async function validSession(payload: { sub: string; sid?: string }) {
  if (!payload.sid) return false
  const session = await prisma.session.findFirst({ where: { id: payload.sid, userId: payload.sub, revokedAt: null, expiresAt: { gt: new Date() }, user: { email_verified_at: { not: null } } }, select: { id: true } })
  return Boolean(session)
}
