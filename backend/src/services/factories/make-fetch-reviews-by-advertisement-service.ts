import { PrismaReviewsRepository } from '@/repositories/prisma/prisma-reviews-repository'
import { FetchReviewsByAdvertisementService } from '../fetch-reviews-by-advertisement'

export function makeFetchReviewsByAdvertisementService() {
  const reviewsRepository = new PrismaReviewsRepository()
  const service = new FetchReviewsByAdvertisementService(reviewsRepository)

  return service
}
