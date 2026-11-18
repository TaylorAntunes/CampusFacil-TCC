import { FastifyRequest, FastifyReply } from 'fastify'
import { validSession } from '@/services/session'
export async function verifyJWT(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
    if (!await validSession(request.user)) throw new Error('Invalid session')
  } catch {
    return reply.status(401).send({ message: 'Sessão inválida ou expirada. Entre novamente.' })
  }
}
