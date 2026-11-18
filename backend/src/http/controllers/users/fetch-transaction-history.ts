import { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaServiceRequestsRepository } from '@/repositories/prisma/prisma-service-requests-repository'
import { FetchUserTransactionHistoryService } from '@/services/fetch-user-transaction-history'

export async function fetchTransactionHistory(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const serviceRequestsRepository = new PrismaServiceRequestsRepository()
  const fetchUserTransactionHistory = new FetchUserTransactionHistoryService(
    serviceRequestsRepository,
  )

  const { serviceRequests } = await fetchUserTransactionHistory.execute({
    userId: request.user.sub,
  })

  return reply.status(200).send({ serviceRequests })
}
