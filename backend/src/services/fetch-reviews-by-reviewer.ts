import { ReviewsRepository } from '@/repositories/reviews-repository'
import { Review } from '@prisma/client'

interface FetchReviewsByReviewerServiceRequest {
  reviewerId: string
}

interface FetchReviewsByReviewerServiceResponse {
  reviews: Review[]
}

export class FetchReviewsByReviewerService {
  constructor(private reviewsRepository: ReviewsRepository) {}

  async execute({
    reviewerId,
  }: FetchReviewsByReviewerServiceRequest): Promise<FetchReviewsByReviewerServiceResponse> {
    const reviews = await this.reviewsRepository.findByReviewerId(reviewerId)

    return { reviews }
  }
}
