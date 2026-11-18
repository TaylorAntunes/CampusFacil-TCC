import { PrismaReviewsRepository } from '@/repositories/prisma/prisma-reviews-repository'
import { FetchReviewsByReviewerService } from '../fetch-reviews-by-reviewer'

export function makeFetchReviewsByReviewerService() {
  const reviewsRepository = new PrismaReviewsRepository()
  const service = new FetchReviewsByReviewerService(reviewsRepository)

  return service
}
