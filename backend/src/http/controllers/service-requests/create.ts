import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { CreateServiceRequestService } from '@/services/create-service-request'
import { PrismaServiceRequestsRepository } from '@/repositories/prisma/prisma-service-requests-repository'
import { PrismaAdvertisementsRepository } from '@/repositories/prisma/prisma-advertisements-repository'
import { PrismaNotificationsRepository } from '@/repositories/prisma/prisma-notifications-repository'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createServiceRequestSchema = z.object({
    advertisementId: z.string().optional(),
    message: z.string().trim().min(1).max(5000),
  })

  const { advertisementId, message } = createServiceRequestSchema.parse(
    request.body,
  )

  const serviceRequestsRepository = new PrismaServiceRequestsRepository()
  const advertisementsRepository = new PrismaAdvertisementsRepository()
  const notificationsRepository = new PrismaNotificationsRepository()

  const createServiceRequestService = new CreateServiceRequestService(
    serviceRequestsRepository,
    advertisementsRepository,
    notificationsRepository,
    request.server.io,
  )

  await createServiceRequestService.execute({
    advertisementId,
    message,
    requesterId: request.user.sub,
  })

  return reply.status(201).send()
}
