import { AdvertisementsRepository } from '@/repositories/advertisements-repository'
import { PrismaAdvertisementsRepository } from '@/repositories/prisma/prisma-advertisements-repository'
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository'
import { GetSellerProfileService } from '../get-seller-profile'

export function makeGetSellerProfileService() {
  const usersRepository = new PrismaUsersRepository()
  const advertisementsRepository = new PrismaAdvertisementsRepository()

  return new GetSellerProfileService(usersRepository, advertisementsRepository)
}
