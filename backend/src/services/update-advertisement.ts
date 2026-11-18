import { AdvertisementsRepository } from '@/repositories/advertisements-repository'
import { Advertisement } from '@prisma/client'

interface UpdateAdvertisementServiceRequest {
  advertisementId: string
  userId: string
  title?: string
  description?: string
  price?: number
  categoryId?: string
  image?: string
}

interface UpdateAdvertisementServiceResponse {
  advertisement: Advertisement
}

export class UpdateAdvertisementService {
  constructor(private advertisementsRepository: AdvertisementsRepository) {}

  async execute({
    advertisementId,
    userId,
    title,
    description,
    price,
    categoryId,
    image,
  }: UpdateAdvertisementServiceRequest): Promise<UpdateAdvertisementServiceResponse> {
    const advertisement =
      await this.advertisementsRepository.findById(advertisementId)

    if (!advertisement) {
      throw new Error('Advertisement not found')
    }

    if (advertisement.authorId !== userId) {
      throw new Error('Unauthorized')
    }

    const updatedAdvertisement = await this.advertisementsRepository.update(
      advertisementId,
      {
        title,
        description,
        price,
        categoryId,
        image,
      },
    )

    return { advertisement: updatedAdvertisement }
  }
}
