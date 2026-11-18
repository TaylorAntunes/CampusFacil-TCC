import { prisma } from '@/lib/prisma'
import { DashboardRepository, DashboardStats } from '../dashboard-repository'

export class PrismaDashboardRepository implements DashboardRepository {
  async getStats(userId: string): Promise<DashboardStats> {
    const publishedAdvertisements = await prisma.advertisement.count({
      where: {
        authorId: userId,
      },
    })

    const activeServiceRequests = await prisma.serviceRequest.count({
      where: {
        advertisement: {
          authorId: userId,
        },
        status: 'IN_PROGRESS',
      },
    })

    const unreadMessages = await prisma.message.count({
      where: {
        receiverId: userId,
        read: false,
      },
    })

    const [paidRequests, reviewAggregate] = await Promise.all([
      prisma.serviceRequest.findMany({
        where: {
          advertisement: {
            authorId: userId,
          },
          status: {
            in: ['IN_PROGRESS', 'COMPLETED'],
          },
        },
        select: {
          advertisement: {
            select: {
              price: true,
            },
          },
        },
      }),
      prisma.review.aggregate({
        where: {
          advertisement: {
            authorId: userId,
          },
        },
        _avg: {
          rating: true,
        },
      }),
    ])

    const monthlyEarnings = paidRequests.reduce((sum, request) => {
      return sum + Number(request.advertisement?.price ?? 0)
    }, 0)

    const contracts = paidRequests.length
    const rating = reviewAggregate._avg.rating ?? 0

    return {
      publishedAdvertisements,
      activeServiceRequests,
      unreadMessages,
      rating,
      monthlyEarnings,
      monthlySpent: 0,
      contracts,
    }
  }
}
