import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { PrismaAdvertisementsRepository } from '@/repositories/prisma/prisma-advertisements-repository'
import { DeleteAdvertisementService } from '@/services/delete-advertisement'

export async function deleteAdvertisement(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const deleteParamsSchema = z.object({
    advertisementId: z.string(),
  })

  const { advertisementId } = deleteParamsSchema.parse(request.params)

  const advertisementsRepository = new PrismaAdvertisementsRepository()
  const deleteAdvertisementService = new DeleteAdvertisementService(
    advertisementsRepository,
  )

  try {
    await deleteAdvertisementService.execute({
      advertisementId,
      userId: request.user.sub,
    })

    return reply.status(204).send()
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(error.message === 'Unauthorized' ? 403 : 404).send({
        message: error.message,
      })
    }
  }
}
