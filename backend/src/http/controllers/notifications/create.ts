import { FastifyRequest, FastifyReply } from 'fastify'

// System notifications are created only by authorized domain operations.
// Keep the endpoint explicit for existing clients, but never accept user-authored system events.
export async function create(_request: FastifyRequest, reply: FastifyReply) {
  return reply.status(403).send({ message: 'As notificações são geradas automaticamente pelas ações autorizadas do sistema.' })
}
