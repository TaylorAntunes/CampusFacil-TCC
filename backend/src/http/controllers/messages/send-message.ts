import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const bodySchema = z.object({
  recipientId: z.string().uuid(),
  content: z.string().trim().min(1).max(10000),
})

const userSelect = {
  id: true,
  name: true,
  email: true,
  avatar_url: true,
} as const

export async function sendMessage(request: FastifyRequest, reply: FastifyReply) {
  const senderId = request.user.sub
  const { recipientId, content } = bodySchema.parse(request.body)

  if (recipientId === senderId) {
    return reply
      .status(400)
      .send({ message: 'Nao e permitido enviar mensagem para si mesmo.' })
  }

  const message = await prisma.message.create({
    data: {
      senderId,
      receiverId: recipientId,
      content: content.trim(),
    },
    include: {
      sender: { select: userSelect },
      receiver: { select: userSelect },
    },
  })

  const serializedMessage = {
    id: message.id,
    content: message.content,
    read: message.read,
    createdAt: message.createdAt.toISOString(),
    senderId: message.senderId,
    receiverId: message.receiverId,
    sender: message.sender,
    receiver: message.receiver,
  }

  request.server.io.to(senderId).emit('new_message', serializedMessage)
  request.server.io.to(recipientId).emit('new_message', serializedMessage)

  return reply.status(201).send({ message: serializedMessage })
}
