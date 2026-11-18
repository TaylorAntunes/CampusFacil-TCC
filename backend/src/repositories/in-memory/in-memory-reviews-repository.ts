import { Prisma, Review } from '@prisma/client'
import { ReviewsRepository } from '../reviews-repository'

export class InMemoryReviewsRepository implements ReviewsRepository {
  public items: Review[] = []

  async create(data: Prisma.ReviewUncheckedCreateInput) {
    const review = {
      id: data.id ?? 'review-1',
      rating: data.rating,
      comment: data.comment ?? null,
      advertisementId: data.advertisementId,
      reviewerId: data.reviewerId,
      created_at: new Date(),
    }

    this.items.push(review as Review)

    return review as Review
  }

  async findByAdvertisementId(advertisementId: string) {
    return this.items.filter(
      (review) => review.advertisementId === advertisementId,
    )
  }

  async findByReviewerId(reviewerId: string) {
    return this.items.filter((review) => review.reviewerId === reviewerId)
  }
}
