import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeDeleteServiceRequestService } from '@/services/factories/make-delete-service-request-service'

export async function deleteController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const deleteServiceRequestParamsSchema = z.object({
    serviceRequestId: z.string().uuid(),
  })

  const { serviceRequestId } = deleteServiceRequestParamsSchema.parse(
    request.params,
  )

  const deleteServiceRequestService = makeDeleteServiceRequestService()

  await deleteServiceRequestService.execute({
    serviceRequestId,
    actorUserId: request.user.sub,
  })

  return reply.status(204).send() // 204 No Content for successful deletion
}
