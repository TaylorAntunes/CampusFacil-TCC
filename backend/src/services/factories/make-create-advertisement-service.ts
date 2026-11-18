import { CreateAdvertisementService } from '@/services/create-advertisements'
import { PrismaAdvertisementsRepository } from '@/repositories/prisma/prisma-advertisements-repository'
import { PrismaCategoriesRepository } from '@/repositories/prisma/prisma-categories-repository'

export function makeCreateAdvertisementService() {
  const advertisementsRepository = new PrismaAdvertisementsRepository()
  const categoriesRepository = new PrismaCategoriesRepository()
  const service = new CreateAdvertisementService(
    advertisementsRepository,
    categoriesRepository,
  )

  return service
}
