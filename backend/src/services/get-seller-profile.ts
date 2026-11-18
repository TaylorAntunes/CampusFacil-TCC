import { AdvertisementsRepository } from '@/repositories/advertisements-repository'
import { UsersRepository } from '@/repositories/users-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

export class GetSellerProfileService {
  constructor(
    private usersRepository: UsersRepository,
    private advertisementsRepository: AdvertisementsRepository,
  ) {}

  async execute(sellerId: string) {
    const seller = await this.usersRepository.findById(sellerId)

    if (!seller) {
      throw new ResourceNotFoundError()
    }

    const advertisements =
      await this.advertisementsRepository.findManyByUserId(sellerId)

    return { seller, advertisements }
  }
}
