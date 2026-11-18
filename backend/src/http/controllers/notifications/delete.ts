import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { PrismaNotificationsRepository } from '@/repositories/prisma/prisma-notifications-repository'
import { DeleteNotificationService } from '@/services/delete-notification'

export async function deleteNotification(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const deleteNotificationParamsSchema = z.object({
    notificationId: z.string().uuid(),
  })

  const { notificationId } = deleteNotificationParamsSchema.parse(
    request.params,
  )

  const notificationsRepository = new PrismaNotificationsRepository()
  const deleteNotificationService = new DeleteNotificationService(
    notificationsRepository,
  )

  await deleteNotificationService.execute({
    notificationId,
    userId: request.user.sub,
  })

  return reply.status(200).send()
}
