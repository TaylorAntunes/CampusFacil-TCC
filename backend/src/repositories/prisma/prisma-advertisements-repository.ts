import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import {
  AdvertisementWithRatingAndReviews,
  AdvertisementsRepository,
} from '../advertisements-repository'

export class PrismaAdvertisementsRepository
  implements AdvertisementsRepository
{
  async findById(id: string) {
    const advertisement = await prisma.advertisement.findUnique({
      where: {
        id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar_url: true,
            bio: true,
            created_at: true,
          },
        },
        category: true,
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                avatar_url: true,
              },
            },
          },
        },
      },
    })

    return advertisement
  }

  async searchMany(
    query: string,
    page: number,
    category?: string,
    availability?: string,
  ): Promise<AdvertisementWithRatingAndReviews[]> {
    const advertisements = await prisma.advertisement.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                title: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
              {
                description: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
            ],
          },
          availability ? { availability } : {},
          category
            ? {
                category: {
                  name: {
                    equals: category,
                    mode: 'insensitive',
                  },
                },
              }
            : {},
        ],
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar_url: true,
          },
        },
        category: true,
        reviews: {
          select: {
            rating: true,
            created_at: true,
          },
        },
      },
      take: 20,
      skip: (page - 1) * 20,
    })

    return advertisements.map(
      (advertisement): AdvertisementWithRatingAndReviews => {
        const reviews = advertisement.reviews ?? []
        const reviewCount = reviews.length
        const rating =
          reviewCount > 0
            ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviewCount
            : 0

        return {
          ...advertisement,
          rating,
          reviewCount,
        }
      },
    )
  }

  async create(data: Prisma.AdvertisementUncheckedCreateInput) {
    const advertisement = await prisma.advertisement.create({
      data,
    })

    return advertisement
  }

  async findManyByUserId(userId: string) {
    const advertisements = await prisma.advertisement.findMany({
      where: {
        authorId: userId,
      },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            avatar_url: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    return advertisements
  }

  async update(
    id: string,
    data: Partial<Prisma.AdvertisementUncheckedCreateInput>,
  ) {
    const updatePayload: Prisma.AdvertisementUpdateInput = {}

    if (data.title !== undefined) updatePayload.title = data.title
    if (data.description !== undefined) updatePayload.description = data.description
    if (data.price !== undefined) updatePayload.price = new Prisma.Decimal(data.price.toString())
    if (data.image !== undefined) updatePayload.image = data.image
    if (data.categoryId) {
      updatePayload.category = {
        connect: {
          id: data.categoryId,
        },
      }
    }

    const advertisement = await prisma.advertisement.update({
      where: {
        id,
      },
      data: updatePayload,
    })

    return advertisement
  }

  async delete(id: string) {
    await prisma.advertisement.delete({
      where: {
        id,
      },
    })
  }
}
