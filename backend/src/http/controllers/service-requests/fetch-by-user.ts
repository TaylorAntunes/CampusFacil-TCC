import { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaServiceRequestsRepository } from '@/repositories/prisma/prisma-service-requests-repository'
import { FetchUserServiceRequestsService } from '@/services/fetch-user-service-requests'

export async function fetchByUser(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const serviceRequestsRepository = new PrismaServiceRequestsRepository()
  const fetchUserServiceRequests = new FetchUserServiceRequestsService(
    serviceRequestsRepository,
  )

  const { serviceRequests } = await fetchUserServiceRequests.execute({
    userId: request.user.sub,
  })

  return reply.status(200).send({ serviceRequests })
}
