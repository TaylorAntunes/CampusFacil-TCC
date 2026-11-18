import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeGetAdvertisementService } from '@/services/factories/make-get-advertisement-service'

export async function getById(request: FastifyRequest, reply: FastifyReply) {
  const getByIdParamsSchema = z.object({
    advertisementId: z.string().uuid(),
  })

  const { advertisementId } = getByIdParamsSchema.parse(request.params)

  const getAdvertisementService = makeGetAdvertisementService()

  const { advertisement } =
    await getAdvertisementService.execute(advertisementId)

  return reply.status(200).send({ advertisement })
}
