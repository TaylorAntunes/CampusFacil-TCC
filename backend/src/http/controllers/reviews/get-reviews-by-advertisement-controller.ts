import { makeFetchReviewsByAdvertisementService } from '@/services/factories/make-fetch-reviews-by-advertisement-service'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export async function getReviewsByAdvertisementController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const getReviewsByAdvertisementParamsSchema = z.object({
    advertisementId: z.string().uuid(),
  })

  const { advertisementId } = getReviewsByAdvertisementParamsSchema.parse(
    request.params,
  )

  const fetchReviewsByAdvertisementService =
    makeFetchReviewsByAdvertisementService()

  const { reviews } = await fetchReviewsByAdvertisementService.execute({
    advertisementId,
  })

  return reply.status(200).send({ reviews })
}
