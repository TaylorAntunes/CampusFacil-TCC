import { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaNotificationsRepository } from '@/repositories/prisma/prisma-notifications-repository'
import { MarkAllNotificationsAsReadService } from '@/services/mark-all-notifications-as-read'

export async function markAllAsRead(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const notificationsRepository = new PrismaNotificationsRepository()
  const markAllNotificationsAsRead = new MarkAllNotificationsAsReadService(
    notificationsRepository,
  )

  await markAllNotificationsAsRead.execute({
    recipientId: request.user.sub,
  })

  return reply.status(200).send()
}
