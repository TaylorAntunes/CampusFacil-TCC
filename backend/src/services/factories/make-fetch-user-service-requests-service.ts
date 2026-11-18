import { FetchUserServiceRequestsService } from '@/services/fetch-user-service-requests'
import { PrismaServiceRequestsRepository } from '@/repositories/prisma/prisma-service-requests-repository'

export function makeFetchUserServiceRequestsService() {
  const serviceRequestsRepository = new PrismaServiceRequestsRepository()
  const service = new FetchUserServiceRequestsService(serviceRequestsRepository)

  return service
}
