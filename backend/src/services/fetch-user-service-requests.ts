import { ServiceRequest } from '@prisma/client'
import { ServiceRequestsRepository } from '@/repositories/service-requests-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

interface FetchUserServiceRequestsServiceRequest {
  userId: string
}

interface FetchUserServiceRequestsServiceResponse {
  serviceRequests: ServiceRequest[]
}

export class FetchUserServiceRequestsService {
  constructor(private serviceRequestsRepository: ServiceRequestsRepository) {}

  async execute({
    userId,
  }: FetchUserServiceRequestsServiceRequest): Promise<FetchUserServiceRequestsServiceResponse> {
    const serviceRequests =
      await this.serviceRequestsRepository.findManyByUserId(userId)

    return { serviceRequests }
  }
}
