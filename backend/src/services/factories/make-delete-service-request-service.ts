import { PrismaAdvertisementsRepository } from '@/repositories/prisma/prisma-advertisements-repository'
import { PrismaServiceRequestsRepository } from '@/repositories/prisma/prisma-service-requests-repository'
import { DeleteServiceRequestService } from '@/services/delete-service-request'

export function makeDeleteServiceRequestService() {
  const serviceRequestsRepository = new PrismaServiceRequestsRepository()
  const service = new DeleteServiceRequestService(serviceRequestsRepository, new PrismaAdvertisementsRepository())

  return service
}
