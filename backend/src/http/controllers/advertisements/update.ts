import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { PrismaAdvertisementsRepository } from '@/repositories/prisma/prisma-advertisements-repository'
import { UpdateAdvertisementService } from '@/services/update-advertisement'
import { getMultipartFieldValue } from '@/utils/get-multipart-field-value'
import { saveUploadedAdvertisementImage } from '@/utils/upload-advertisement-image'

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const updateParamsSchema = z.object({
    advertisementId: z.string(),
  })

  const updateBodySchema = z.object({
    title: z.string().trim().min(3).max(160).optional(),
    description: z.string().trim().min(20).max(10000).optional(),
    price: z.coerce.number().finite().min(0).max(1000000).optional(),
    categoryId: z.string().optional(),
    category: z.string().optional(),
    image: z.string().optional(),
  })

  const { advertisementId } = updateParamsSchema.parse(request.params)
  const uploadImage = await saveUploadedAdvertisementImage(request)
  const body = (request.body ?? {}) as Record<string, unknown>
  const parsedImage = getMultipartFieldValue(body.image)
  const { title, description, price, categoryId, category, image } =
    updateBodySchema.parse({
      title: getMultipartFieldValue(body.title),
      description: getMultipartFieldValue(body.description),
      price: getMultipartFieldValue(body.price),
      categoryId: getMultipartFieldValue(body.categoryId),
      category: getMultipartFieldValue(body.category),
      image: typeof parsedImage === 'string' ? parsedImage : undefined,
    })

  const advertisementsRepository = new PrismaAdvertisementsRepository()
  const updateAdvertisementService = new UpdateAdvertisementService(
    advertisementsRepository,
  )

  try {
    const { advertisement } = await updateAdvertisementService.execute({
      advertisementId,
      userId: request.user.sub,
      title,
      description,
      price,
      categoryId: categoryId ?? category,
      image: uploadImage ?? image,
    })

    return reply.status(200).send({ advertisement })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return reply.status(403).send({ message: error.message })
      }
      if (error.message === 'Advertisement not found') {
        return reply.status(404).send({ message: error.message })
      }
      console.error('Failed to update advertisement:', error)
    }
    return reply.status(500).send({ message: 'Erro ao atualizar anúncio' })
  }
}
