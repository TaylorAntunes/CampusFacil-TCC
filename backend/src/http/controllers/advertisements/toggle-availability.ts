import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { PrismaAdvertisementsRepository } from '@/repositories/prisma/prisma-advertisements-repository'
import { ToggleAdvertisementAvailabilityService } from '@/services/toggle-advertisement-availability'

export async function toggleAvailability(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const toggleParamsSchema = z.object({
    advertisementId: z.string(),
  })

  const { advertisementId } = toggleParamsSchema.parse(request.params)

  const advertisementsRepository = new PrismaAdvertisementsRepository()
  const toggleAdvertisementAvailabilityService =
    new ToggleAdvertisementAvailabilityService(advertisementsRepository)

  try {
    const { advertisement } =
      await toggleAdvertisementAvailabilityService.execute({
        advertisementId,
        userId: request.user.sub,
      })

    return reply.status(200).send({ advertisement })
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(error.message === 'Unauthorized' ? 403 : 404).send({
        message: error.message,
      })
    }
  }
}
