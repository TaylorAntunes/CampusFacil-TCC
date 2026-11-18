import { AdvertisementsRepository } from '@/repositories/advertisements-repository'

interface DeleteAdvertisementServiceRequest {
  advertisementId: string
  userId: string
}

export class DeleteAdvertisementService {
  constructor(private advertisementsRepository: AdvertisementsRepository) {}

  async execute({
    advertisementId,
    userId,
  }: DeleteAdvertisementServiceRequest): Promise<void> {
    const advertisement =
      await this.advertisementsRepository.findById(advertisementId)

    if (!advertisement) {
      throw new Error('Advertisement not found')
    }

    if (advertisement.authorId !== userId) {
      throw new Error('Unauthorized')
    }

    await this.advertisementsRepository.delete(advertisementId)
  }
}
