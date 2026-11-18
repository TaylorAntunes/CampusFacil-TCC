import { Prisma, Review } from '@prisma/client'

export interface ReviewsRepository {
  create(data: Prisma.ReviewUncheckedCreateInput): Promise<Review>
  findByAdvertisementId(advertisementId: string): Promise<Review[]>
  findByReviewerId(reviewerId: string): Promise<Review[]>
}
