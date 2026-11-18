import { ServiceRequest } from '@prisma/client'
import { ServiceRequestsRepository } from '@/repositories/service-requests-repository'
import { AdvertisementsRepository } from '@/repositories/advertisements-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

interface FetchAdvertisementServiceRequestsServiceRequest {
  advertisementId: string
  actorUserId: string
}
interface FetchAdvertisementServiceRequestsServiceResponse {
  serviceRequests: ServiceRequest[]
}
export class FetchAdvertisementServiceRequestsService {
  constructor(
    private serviceRequestsRepository: ServiceRequestsRepository,
    private advertisementsRepository: AdvertisementsRepository,
  ) {}
  async execute({ advertisementId, actorUserId }: FetchAdvertisementServiceRequestsServiceRequest): Promise<FetchAdvertisementServiceRequestsServiceResponse> {
    const advertisement = await this.advertisementsRepository.findById(advertisementId)
    if (!advertisement) throw new ResourceNotFoundError()
    const serviceRequests = advertisement.authorId === actorUserId
      ? await this.serviceRequestsRepository.findByAdvertisementId(advertisementId)
      : await this.serviceRequestsRepository.findManyByAdvertisementIdAndRequesterId(advertisementId, actorUserId)
    return { serviceRequests }
  }
}
