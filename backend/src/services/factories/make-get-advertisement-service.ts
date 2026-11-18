import { PrismaAdvertisementsRepository } from '@/repositories/prisma/prisma-advertisements-repository'
import { GetAdvertisementService } from '../get-advertisement'

export function makeGetAdvertisementService() {
  const advertisementsRepository = new PrismaAdvertisementsRepository()
  const service = new GetAdvertisementService(advertisementsRepository)

  return service
}
