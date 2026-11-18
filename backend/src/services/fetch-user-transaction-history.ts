import { ServiceRequest, RequestStatus } from '@prisma/client'
import { ServiceRequestsRepository } from '@/repositories/service-requests-repository'

interface FetchUserTransactionHistoryServiceRequest {
  userId: string
}

interface FetchUserTransactionHistoryServiceResponse {
  serviceRequests: ServiceRequest[]
}

export class FetchUserTransactionHistoryService {
  constructor(private serviceRequestsRepository: ServiceRequestsRepository) {}

  async execute({
    userId,
  }: FetchUserTransactionHistoryServiceRequest): Promise<FetchUserTransactionHistoryServiceResponse> {
    const serviceRequests =
      await this.serviceRequestsRepository.findManyByUserId(userId)

    return { serviceRequests }
  }
}
