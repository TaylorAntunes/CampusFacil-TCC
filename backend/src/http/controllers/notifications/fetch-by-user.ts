import { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaNotificationsRepository } from '@/repositories/prisma/prisma-notifications-repository'
import { FetchUserNotificationsService } from '@/services/fetch-user-notifications'

export async function fetchByUser(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const notificationsRepository = new PrismaNotificationsRepository()
  const fetchUserNotifications = new FetchUserNotificationsService(
    notificationsRepository,
  )

  const { notifications } = await fetchUserNotifications.execute({
    recipientId: request.user.sub,
  })

  const formattedNotifications = notifications.map((notification) => ({
    id: notification.id,
    recipientId: notification.recipientId,
    type: notification.type,
    message: notification.message,
    read: notification.read,
    createdAt: notification.created_at.toISOString(),
    metadata: notification.metadata,
  }))

  return reply.status(200).send({ notifications: formattedNotifications })
}
