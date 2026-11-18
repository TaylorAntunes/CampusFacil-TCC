import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { PrismaAdvertisementsRepository } from '@/repositories/prisma/prisma-advertisements-repository'
import { SearchAdvertisementsService } from '@/services/search-advertisements'

export async function search(request: FastifyRequest, reply: FastifyReply) {
  const searchQuerySchema = z.object({
    q: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
    category: z.string().optional(),
    availability: z.string().optional(),
  })

  const { q, page, category, availability } = searchQuerySchema.parse(
    request.query,
  )

  const advertisementsRepository = new PrismaAdvertisementsRepository()
  const searchAdvertisementsService = new SearchAdvertisementsService(
    advertisementsRepository,
  )

  const { advertisements } = await searchAdvertisementsService.execute({
    query: q ?? '',
    page,
    category,
    availability,
  })

  return reply.status(200).send({ advertisements })
}
