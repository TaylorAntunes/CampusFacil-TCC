import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { PrismaServiceRequestsRepository } from '@/repositories/prisma/prisma-service-requests-repository'
import { GetServiceRequestService } from '@/services/get-service-request'

export async function getRequest(request: FastifyRequest, reply: FastifyReply) {
  const getRequestParamsSchema = z.object({
    serviceRequestId: z.uuid(),
  })

  const { serviceRequestId } = getRequestParamsSchema.parse(request.params)

  const serviceRequestsRepository = new PrismaServiceRequestsRepository()
  const getServiceRequest = new GetServiceRequestService(
    serviceRequestsRepository,
  )

  const { serviceRequest } = await getServiceRequest.execute({
    serviceRequestId,
  })

  return reply.status(200).send({ serviceRequest })
}
