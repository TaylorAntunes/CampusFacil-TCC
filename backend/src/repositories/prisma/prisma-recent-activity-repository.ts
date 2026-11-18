import { prisma } from '@/lib/prisma'
import {
  RecentActivity,
  RecentActivityRepository,
} from '../recent-activity-repository'

export class PrismaRecentActivityRepository
  implements RecentActivityRepository
{
  async getRecentActivity(
    userId: string,
    limit: number = 10,
  ): Promise<RecentActivity[]> {
    // Fetch recent advertisements
    const recentAdvertisements = await prisma.advertisement.findMany({
      where: { authorId: userId },
      orderBy: { created_at: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        created_at: true,
      },
    })

    // Fetch recent service requests
    const recentServiceRequests = await prisma.serviceRequest.findMany({
      where: {
        OR: [{ requesterId: userId }, { advertisement: { authorId: userId } }],
      },
      orderBy: { updated_at: 'desc' },
      take: limit,
      select: {
        id: true,
        status: true,
        message: true,
        updated_at: true,
        advertisement: {
          select: {
            title: true,
          },
        },
      },
    })

    // Fetch recent reviews
    const recentReviews = await prisma.review.findMany({
      where: {
        OR: [{ reviewerId: userId }, { advertisement: { authorId: userId } }],
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      select: {
        id: true,
        rating: true,
        comment: true,
        created_at: true,
        advertisement: {
          select: {
            title: true,
          },
        },
      },
    })

    // Combine and format activities
    const activities: RecentActivity[] = []

    // Add advertisements
    recentAdvertisements.forEach((ad) => {
      activities.push({
        id: `ad-${ad.id}`,
        type: 'ADVERTISEMENT_CREATED',
        description: `Anúncio criado: "${ad.title}"`,
        timestamp: new Date(ad.created_at),
        metadata: { advertisementId: ad.id, advertisementTitle: ad.title },
      })
    })

    // Add service requests
    recentServiceRequests.forEach((sr) => {
      activities.push({
        id: `sr-${sr.id}`,
        type: 'SERVICE_REQUEST_UPDATED',
        description: `Pedido de serviço - Status: ${sr.status}${sr.advertisement ? ` para "${sr.advertisement.title}"` : ''}`,
        timestamp: new Date(sr.updated_at),
        metadata: {
          serviceRequestId: sr.id,
          status: sr.status,
          advertisementTitle: sr.advertisement?.title,
        },
      })
    })

    // Add reviews
    recentReviews.forEach((review) => {
      activities.push({
        id: `rev-${review.id}`,
        type: 'REVIEW_CREATED',
        description: `Avaliação recebida: ${review.rating} estrelas${review.advertisement ? ` para "${review.advertisement.title}"` : ''}`,
        timestamp: new Date(review.created_at),
        metadata: {
          reviewId: review.id,
          rating: review.rating,
          comment: review.comment,
          advertisementTitle: review.advertisement?.title,
        },
      })
    })

    // Sort by timestamp descending and return top X
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }
}
