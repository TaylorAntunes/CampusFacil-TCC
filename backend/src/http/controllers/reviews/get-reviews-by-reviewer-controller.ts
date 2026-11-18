import { makeFetchReviewsByReviewerService } from '@/services/factories/make-fetch-reviews-by-reviewer-service'
import { FastifyRequest, FastifyReply } from 'fastify'

export async function getReviewsByReviewerController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const fetchReviewsByReviewerService = makeFetchReviewsByReviewerService()

  const { reviews } = await fetchReviewsByReviewerService.execute({
    reviewerId: request.user.sub,
  })

  return reply.status(200).send({ reviews })
}
