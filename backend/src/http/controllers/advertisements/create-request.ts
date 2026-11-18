import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { PrismaAdvertisementsRepository } from '@/repositories/prisma/prisma-advertisements-repository'
import { CreateServiceRequestService } from '@/services/create-service-request'
import { PrismaServiceRequestsRepository } from '@/repositories/prisma/prisma-service-requests-repository'
import { PrismaNotificationsRepository } from '@/repositories/prisma/prisma-notifications-repository'

export async function createRequest(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const createRequestParamsSchema = z.object({
    advertisementId: z.string().uuid().optional(),
  })

  const createRequestBodySchema = z.object({
    message: z.string().min(1),
  })

  const { advertisementId } = createRequestParamsSchema.parse(request.params)
  const { message } = createRequestBodySchema.parse(request.body)

  const serviceRequestsRepository = new PrismaServiceRequestsRepository()
  const advertisementsRepository = new PrismaAdvertisementsRepository() 
  const notificationsRepository = new PrismaNotificationsRepository()
  const createServiceRequest = new CreateServiceRequestService(
    serviceRequestsRepository,
    advertisementsRepository,
    notificationsRepository,
    request.server.io,
  )

  await createServiceRequest.execute({
    advertisementId,
    requesterId: request.user.sub,
    message,
  })

  return reply.status(201).send()
}
