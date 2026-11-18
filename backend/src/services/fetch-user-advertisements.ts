import { Advertisement } from '@prisma/client'
import { AdvertisementsRepository } from '@/repositories/advertisements-repository'

interface FetchUserAdvertisementsServiceRequest {
  userId: string
}

interface FetchUserAdvertisementsServiceResponse {
  advertisements: Advertisement[]
}

export class FetchUserAdvertisementsService {
  constructor(private advertisementsRepository: AdvertisementsRepository) {}

  async execute({
    userId,
  }: FetchUserAdvertisementsServiceRequest): Promise<FetchUserAdvertisementsServiceResponse> {
    const advertisements =
      await this.advertisementsRepository.findManyByUserId(userId)

    return { advertisements }
  }
}
