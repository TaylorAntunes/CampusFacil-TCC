import { FetchUserAdvertisementsService } from '@/services/fetch-user-advertisements'
import { PrismaAdvertisementsRepository } from '@/repositories/prisma/prisma-advertisements-repository'

export function makeFetchUserAdvertisementsService() {
  const advertisementsRepository = new PrismaAdvertisementsRepository()
  const service = new FetchUserAdvertisementsService(advertisementsRepository)

  return service
}
