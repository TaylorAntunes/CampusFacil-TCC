import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const paramsSchema = z.object({
  participantId: z.string().uuid(),
})

export async function markThreadAsRead(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const userId = request.user.sub
  const { participantId } = paramsSchema.parse(request.params)

  const result = await prisma.message.updateMany({
    where: {
      senderId: participantId,
      receiverId: userId,
      read: false,
    },
    data: {
      read: true,
    },
  })

  if (result.count > 0) {
    request.server.io.to(participantId).emit('thread_read', {
      participantId: userId,
      readByUserId: userId,
    })
  }

  return reply.status(204).send()
}
