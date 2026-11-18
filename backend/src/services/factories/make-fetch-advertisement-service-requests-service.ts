import { PrismaAdvertisementsRepository } from '@/repositories/prisma/prisma-advertisements-repository'
import { PrismaServiceRequestsRepository } from '@/repositories/prisma/prisma-service-requests-repository'
import { FetchAdvertisementServiceRequestsService } from '@/services/fetch-advertisement-service-requests'

export function makeFetchAdvertisementServiceRequestsService() {
  const serviceRequestsRepository = new PrismaServiceRequestsRepository()
  const service = new FetchAdvertisementServiceRequestsService(
    serviceRequestsRepository,
    new PrismaAdvertisementsRepository(),
  )

  return service
}
