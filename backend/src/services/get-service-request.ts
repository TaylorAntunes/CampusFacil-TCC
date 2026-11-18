import { ServiceRequest } from '@prisma/client'
import { ServiceRequestsRepository } from '@/repositories/service-requests-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

interface GetServiceRequestServiceRequest {
  serviceRequestId: string
}

interface GetServiceRequestServiceResponse {
  serviceRequest: ServiceRequest
}

export class GetServiceRequestService {
  constructor(private serviceRequestsRepository: ServiceRequestsRepository) {}

  async execute({
    serviceRequestId,
  }: GetServiceRequestServiceRequest): Promise<GetServiceRequestServiceResponse> {
    const serviceRequest =
      await this.serviceRequestsRepository.findById(serviceRequestId)

    if (!serviceRequest) {
      throw new ResourceNotFoundError()
    }

    return { serviceRequest }
  }
}
