import { ReviewsRepository } from '@/repositories/reviews-repository'
import { Review } from '@prisma/client'

interface FetchReviewsByAdvertisementServiceRequest {
  advertisementId: string
}

interface FetchReviewsByAdvertisementServiceResponse {
  reviews: Review[]
}

export class FetchReviewsByAdvertisementService {
  constructor(private reviewsRepository: ReviewsRepository) {}

  async execute({
    advertisementId,
  }: FetchReviewsByAdvertisementServiceRequest): Promise<FetchReviewsByAdvertisementServiceResponse> {
    const reviews =
      await this.reviewsRepository.findByAdvertisementId(advertisementId)

    return { reviews }
  }
}
