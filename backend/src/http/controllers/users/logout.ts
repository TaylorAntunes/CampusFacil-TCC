import { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '@/lib/prisma'
export async function logout(request: FastifyRequest, reply: FastifyReply) {
  await prisma.session.updateMany({ where: { id: request.user.sid, userId: request.user.sub }, data: { revokedAt: new Date() } })
  request.server.io.in('session:' + request.user.sid).disconnectSockets(true)
  return reply.clearCookie('refreshToken', { path: '/' }).status(204).send()
}
