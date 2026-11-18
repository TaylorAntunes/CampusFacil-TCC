import { PrismaAdvertisementsRepository } from '@/repositories/prisma/prisma-advertisements-repository'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { PrismaServiceRequestsRepository } from '@/repositories/prisma/prisma-service-requests-repository'
import { FetchAdvertisementServiceRequestsService } from '@/services/fetch-advertisement-service-requests'

export async function fetchByAdvertisement(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const fetchByAdvertisementParamsSchema = z.object({
    advertisementId: z.uuid(),
  })

  const { advertisementId } = fetchByAdvertisementParamsSchema.parse(
    request.params,
  )

  const serviceRequestsRepository = new PrismaServiceRequestsRepository()
  const fetchAdvertisementServiceRequests =
    new FetchAdvertisementServiceRequestsService(serviceRequestsRepository, new PrismaAdvertisementsRepository())

  const { serviceRequests } = await fetchAdvertisementServiceRequests.execute({
    advertisementId,
    actorUserId: request.user.sub,
  })

  return reply.status(200).send({ serviceRequests })
}
