import { AdvertisementsRepository } from '@/repositories/advertisements-repository'
import { HttpError } from './errors/http-error'
import { ServiceRequestsRepository } from '@/repositories/service-requests-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

interface DeleteServiceRequestServiceRequest {
  serviceRequestId: string
  actorUserId: string
}

type DeleteServiceRequestServiceResponse = void

export class DeleteServiceRequestService {
  constructor(private serviceRequestsRepository: ServiceRequestsRepository, private advertisementsRepository: AdvertisementsRepository) {}

  async execute({
    serviceRequestId,
    actorUserId,
  }: DeleteServiceRequestServiceRequest): Promise<DeleteServiceRequestServiceResponse> {
    const serviceRequest =
      await this.serviceRequestsRepository.findById(serviceRequestId)

    if (!serviceRequest) {
      throw new ResourceNotFoundError()
    }

    const advertisement = serviceRequest.advertisementId ? await this.advertisementsRepository.findById(serviceRequest.advertisementId) : null
    if (serviceRequest.requesterId !== actorUserId && advertisement?.authorId !== actorUserId) throw new HttpError(403, 'Você não pode excluir esta solicitação.')
    await this.serviceRequestsRepository.delete(serviceRequestId)
  }
}
