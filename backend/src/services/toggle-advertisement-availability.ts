import { AdvertisementsRepository } from '@/repositories/advertisements-repository'
import { Advertisement } from '@prisma/client'

interface ToggleAdvertisementAvailabilityServiceRequest {
  advertisementId: string
  userId: string
}

interface ToggleAdvertisementAvailabilityServiceResponse {
  advertisement: Advertisement
}

export class ToggleAdvertisementAvailabilityService {
  constructor(private advertisementsRepository: AdvertisementsRepository) {}

  async execute({
    advertisementId,
    userId,
  }: ToggleAdvertisementAvailabilityServiceRequest): Promise<ToggleAdvertisementAvailabilityServiceResponse> {
    const advertisement =
      await this.advertisementsRepository.findById(advertisementId)

    if (!advertisement) {
      throw new Error('Advertisement not found')
    }

    if (advertisement.authorId !== userId) {
      throw new Error('Unauthorized')
    }

    const newAvailability =
      advertisement.availability === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'

    const updatedAdvertisement = await this.advertisementsRepository.update(
      advertisementId,
      {
        availability: newAvailability,
      },
    )

    return { advertisement: updatedAdvertisement }
  }
}
