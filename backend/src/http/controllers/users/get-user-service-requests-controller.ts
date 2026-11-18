import { FastifyRequest, FastifyReply } from 'fastify'
import { makeFetchUserServiceRequestsService } from '@/services/factories/make-fetch-user-service-requests-service'

export async function fetchUserServiceRequestsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const fetchUserServiceRequestsService = makeFetchUserServiceRequestsService()

  const { serviceRequests } = await fetchUserServiceRequestsService.execute({
    userId: request.user.sub,
  })

  return reply.status(200).send({ serviceRequests })
}
