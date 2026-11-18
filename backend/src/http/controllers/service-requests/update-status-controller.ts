import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeUpdateServiceRequestStatusService } from '@/services/factories/make-update-service-request-status-service'
import { ResourceNotFoundError } from '@/services/errors/resource-not-found-error'

export async function updateStatusController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const updateServiceRequestStatusParamsSchema = z.object({
      serviceRequestId: z.string().uuid(),
    })

    const updateServiceRequestStatusBodySchema = z.object({
      status: z.enum([
        'PENDING',
        'ACCEPTED',
        'IN_PROGRESS',
        'REJECTED',
        'COMPLETED',
        'CANCELLED',
      ]),
    })

    const { serviceRequestId } = updateServiceRequestStatusParamsSchema.parse(
      request.params,
    )
    const { status } = updateServiceRequestStatusBodySchema.parse(request.body)

    const updateServiceRequestStatusService =
      makeUpdateServiceRequestStatusService(request.server.io)

    const { serviceRequest } = await updateServiceRequestStatusService.execute({
      serviceRequestId,
      status,
      actorUserId: request.user.sub,
    })

    return reply.status(200).send({ serviceRequest })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: 'Solicitacao nao encontrada.' })
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return reply.status(403).send({ message: 'Voce nao pode alterar este pedido.' })
    }

    if (error instanceof Error && error.message === 'Invalid status transition') {
      return reply
        .status(400)
        .send({ message: 'Transicao de status invalida para este pedido.' })
    }

    throw error
  }
}
