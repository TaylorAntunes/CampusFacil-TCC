import { Review } from '@prisma/client'
import { ReviewsRepository } from '@/repositories/reviews-repository'
import { AdvertisementsRepository } from '@/repositories/advertisements-repository'
import { UsersRepository } from '@/repositories/users-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

interface CreateReviewServiceRequest {
  rating: number
  comment?: string
  advertisementId: string
  reviewerId: string
}

interface CreateReviewServiceResponse {
  review: Review
}

export class CreateReviewService {
  constructor(
    private reviewsRepository: ReviewsRepository,
    private advertisementsRepository: AdvertisementsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    rating,
    comment,
    advertisementId,
    reviewerId,
  }: CreateReviewServiceRequest): Promise<CreateReviewServiceResponse> {
    const advertisement =
      await this.advertisementsRepository.findById(advertisementId)

    if (!advertisement) {
      throw new ResourceNotFoundError()
    }

    const reviewer = await this.usersRepository.findById(reviewerId)

    if (!reviewer) {
      throw new ResourceNotFoundError()
    }

    const review = await this.reviewsRepository.create({
      rating,
      comment,
      advertisementId,
      reviewerId,
    })

    return { review }
  }
}
