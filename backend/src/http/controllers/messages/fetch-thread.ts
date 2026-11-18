import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const paramsSchema = z.object({
  participantId: z.string().uuid(),
})

const userSelect = {
  id: true,
  name: true,
  email: true,
  avatar_url: true,
} as const

export async function fetchThread(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.user.sub
  const { participantId } = paramsSchema.parse(request.params)

  if (participantId === userId) {
    return reply
      .status(400)
      .send({ message: 'Nao e permitido abrir conversa com si mesmo.' })
  }

  const participant = await prisma.user.findUnique({
    where: { id: participantId },
    select: userSelect,
  })

  if (!participant) {
    return reply.status(404).send({ message: 'Participante nao encontrado.' })
  }

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: participantId },
        { senderId: participantId, receiverId: userId },
      ],
    },
    orderBy: {
      createdAt: 'asc',
    },
    include: {
      sender: { select: userSelect },
      receiver: { select: userSelect },
    },
  })

  return reply.status(200).send({
    participant,
    messages: messages.map((message) => ({
      id: message.id,
      content: message.content,
      read: message.read,
      createdAt: message.createdAt.toISOString(),
      senderId: message.senderId,
      receiverId: message.receiverId,
      sender: message.sender,
      receiver: message.receiver,
    })),
  })
}
