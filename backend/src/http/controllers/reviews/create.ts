import { prisma } from '@/lib/prisma'
import { HttpError } from '@/services/errors/http-error'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { PrismaReviewsRepository } from '@/repositories/prisma/prisma-reviews-repository'
import { PrismaAdvertisementsRepository } from '@/repositories/prisma/prisma-advertisements-repository'
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository'
import { CreateReviewService } from '@/services/create-review'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createReviewBodySchema = z.object({
    rating: z.number().int().min(1).max(5),
    comment: z.string().optional(),
    advertisementId: z.string().uuid(),
  })

  const { rating, comment, advertisementId } = createReviewBodySchema.parse(
    request.body,
  )

  const completed = await prisma.serviceRequest.findFirst({ where: { advertisementId, requesterId: request.user.sub, status: 'COMPLETED', advertisement: { authorId: { not: request.user.sub } } }, select: { id: true } })
  if (!completed) throw new HttpError(403, 'Somente quem concluiu uma contratação pode avaliar o serviço.')
  const reviewsRepository = new PrismaReviewsRepository()
  const advertisementsRepository = new PrismaAdvertisementsRepository()
  const usersRepository = new PrismaUsersRepository()
  const createReview = new CreateReviewService(
    reviewsRepository,
    advertisementsRepository,
    usersRepository,
  )

  await createReview.execute({
    rating,
    comment,
    advertisementId,
    reviewerId: request.user.sub,
  })

  return reply.status(201).send()
}
