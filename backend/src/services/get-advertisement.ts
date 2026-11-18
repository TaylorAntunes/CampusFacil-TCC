import { AdvertisementsRepository } from '@/repositories/advertisements-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

export class GetAdvertisementService {
  constructor(private advertisementsRepository: AdvertisementsRepository) {}

  async execute(id: string) {
    const advertisement = await this.advertisementsRepository.findById(id)

    if (!advertisement) {
      throw new ResourceNotFoundError()
    }

    return { advertisement }
  }
}
