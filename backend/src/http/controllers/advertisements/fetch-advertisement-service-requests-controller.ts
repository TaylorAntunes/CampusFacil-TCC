import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeFetchAdvertisementServiceRequestsService } from '@/services/factories/make-fetch-advertisement-service-requests-service'

export async function fetchAdvertisementServiceRequestsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const fetchAdvertisementServiceRequestsParamsSchema = z.object({
    advertisementId: z.string().uuid(),
  })

  const { advertisementId } =
    fetchAdvertisementServiceRequestsParamsSchema.parse(request.params)

  const fetchAdvertisementServiceRequestsService =
    makeFetchAdvertisementServiceRequestsService()

  const { serviceRequests } =
    await fetchAdvertisementServiceRequestsService.execute({
      advertisementId,
      actorUserId: request.user.sub,
    })

  return reply.status(200).send({ serviceRequests })
}
