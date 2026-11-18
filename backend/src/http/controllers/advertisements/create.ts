import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeCreateAdvertisementService } from '@/services/factories/make-create-advertisement-service'
import { ResourceNotFoundError } from '@/services/errors/resource-not-found-error'
import { getMultipartFieldValue } from '@/utils/get-multipart-field-value'
import { saveUploadedAdvertisementImage } from '@/utils/upload-advertisement-image'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createAdvertisementBodySchema = z.object({
    title: z.string().trim().min(3).max(160),
    description: z.string().trim().min(20).max(10000),
    price: z.coerce.number().finite().min(0).max(1000000),
    availability: z.string().optional(),
    categoryId: z.string().uuid(),
    image: z.any().optional(),
  })

  try {
    const uploadImage = await saveUploadedAdvertisementImage(request)
    const body = (request.body ?? {}) as Record<string, unknown>
    const parsedImage = getMultipartFieldValue(body.image)
    const { title, description, price, availability, categoryId, image } =
      createAdvertisementBodySchema.parse({
        title: getMultipartFieldValue(body.title),
        description: getMultipartFieldValue(body.description),
        price: getMultipartFieldValue(body.price),
        availability: getMultipartFieldValue(body.availability),
        categoryId: getMultipartFieldValue(body.categoryId),
        image: typeof parsedImage === 'string' ? parsedImage : undefined,
      })

    const createAdvertisementService = makeCreateAdvertisementService()

    await createAdvertisementService.execute({
      title,
      description,
      price,
      availability,
      authorId: request.user.sub,
      categoryId,
      image: uploadImage ?? image,
    })

    return reply.status(201).send()
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) throw error
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: 'Dados inválidos para criar anúncio',
        issues: error.flatten(),
      })
    }

    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: 'Categoria não encontrada' })
    }

    console.error('Failed to create advertisement:', error)
    return reply.status(500).send({ message: 'Erro ao criar anúncio' })
  }
}
