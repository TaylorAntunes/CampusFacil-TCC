import { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '@/lib/prisma'

const userSelect = {
  id: true,
  name: true,
  email: true,
  avatar_url: true,
} as const

export async function fetchConversations(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const userId = request.user.sub

  const messages = await prisma.message.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      sender: { select: userSelect },
      receiver: { select: userSelect },
    },
  })

  const conversationMap = new Map<string, (typeof messages)[number][]>()

  for (const message of messages) {
    const participantId =
      message.senderId === userId ? message.receiverId : message.senderId

    if (participantId === userId) {
      continue
    }

    if (!conversationMap.has(participantId)) {
      conversationMap.set(participantId, [])
    }

    conversationMap.get(participantId)?.push(message)
  }

  const conversations = Array.from(conversationMap.entries()).map(
    ([participantId, participantMessages]) => {
      const latestMessage = participantMessages[0]
      const participant =
        latestMessage.senderId === userId
          ? latestMessage.receiver
          : latestMessage.sender

      const unreadCount = participantMessages.filter(
        (message) => message.receiverId === userId && !message.read,
      ).length

      return {
        participant,
        participantId,
        latestMessage: {
          id: latestMessage.id,
          content: latestMessage.content,
          senderId: latestMessage.senderId,
          receiverId: latestMessage.receiverId,
          read: latestMessage.read,
          createdAt: latestMessage.createdAt.toISOString(),
          sender: latestMessage.sender,
          receiver: latestMessage.receiver,
        },
        unreadCount,
      }
    },
  )

  return reply.status(200).send({ conversations })
}
