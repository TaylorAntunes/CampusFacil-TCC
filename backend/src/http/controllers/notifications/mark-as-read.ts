import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { PrismaNotificationsRepository } from '@/repositories/prisma/prisma-notifications-repository'
import { MarkNotificationAsReadService } from '@/services/mark-notification-as-read'

export async function markAsRead(request: FastifyRequest, reply: FastifyReply) {
  const markAsReadParamsSchema = z.object({
    notificationId: z.string().uuid(),
  })

  const { notificationId } = markAsReadParamsSchema.parse(request.params)

  const notificationsRepository = new PrismaNotificationsRepository()
  const markNotificationAsRead = new MarkNotificationAsReadService(
    notificationsRepository,
  )

  await markNotificationAsRead.execute({
    notificationId,
    userId: request.user.sub,
  })

  return reply.status(200).send()
}
