import { prisma } from '@/lib/prisma'
import { Prisma, Review } from '@prisma/client'
import { ReviewsRepository } from '../reviews-repository'

export class PrismaReviewsRepository implements ReviewsRepository {
  async create(data: Prisma.ReviewUncheckedCreateInput) {
    const review = await prisma.review.create({
      data,
    })

    return review
  }

  async findByAdvertisementId(advertisementId: string) {
    const reviews = await prisma.review.findMany({
      where: {
        advertisementId,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            avatar_url: true,
          },
        },
      },
    })

    return reviews
  }

  async findByReviewerId(reviewerId: string) {
    const reviews = await prisma.review.findMany({
      where: {
        reviewerId,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            avatar_url: true,
          },
        },
      },
    })

    return reviews
  }
}
