import { FastifyRequest, FastifyReply } from 'fastify'
import { makeFetchUserAdvertisementsService } from '@/services/factories/make-fetch-user-advertisements-service'

export async function fetchByUser(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const fetchUserAdvertisementsService = makeFetchUserAdvertisementsService()

  const { advertisements } = await fetchUserAdvertisementsService.execute({
    userId: request.user.sub,
  })

  return reply.status(200).send({ advertisements })
}
