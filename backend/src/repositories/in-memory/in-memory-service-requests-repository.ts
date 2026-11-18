import { Prisma, ServiceRequest } from '@prisma/client'
import { ServiceRequestsRepository } from '../service-requests-repository'
import { AdvertisementsRepository } from '../advertisements-repository'

export class InMemoryServiceRequestsRepository
  implements ServiceRequestsRepository
{
  public items: ServiceRequest[] = []

  constructor(private advertisementsRepository: AdvertisementsRepository) {}

  async findManyByUserId(userId: string) {
    const serviceRequests = [] as ServiceRequest[]

    for (const serviceRequest of this.items) {
      const advertisement = await this.advertisementsRepository.findById(
        serviceRequest.advertisementId ?? '',
      )

      if (
        advertisement &&
        (serviceRequest.requesterId === userId ||
          advertisement.authorId === userId)
      ) {
        serviceRequests.push(serviceRequest)
      }
    }

    return serviceRequests
  }

  async findById(id: string) {
    const serviceRequest = this.items.find((item) => item.id === id)

    if (!serviceRequest) {
      return null
    }

    return serviceRequest
  }

  async findByAdvertisementId(advertisementId: string) {
    return this.items.filter((item) => item.advertisementId === advertisementId)
  }

  async findByRequesterId(requesterId: string) {
    return this.items.filter((item) => item.requesterId === requesterId)
  }

  async save(serviceRequest: ServiceRequest) {
    const serviceRequestIndex = this.items.findIndex(
      (item) => item.id === serviceRequest.id,
    )

    if (serviceRequestIndex >= 0) {
      this.items[serviceRequestIndex] = serviceRequest
    }

    return serviceRequest
  }

  async create(data: Prisma.ServiceRequestUncheckedCreateInput) {
    const serviceRequest = {
      id: data.id ?? 'service-request-1',
      advertisementId: data.advertisementId,
      requesterId: data.requesterId,
      status: data.status ?? 'PENDING',
      created_at: new Date(),
      updated_at: new Date(),
    }

    this.items.push(serviceRequest as ServiceRequest)

    return serviceRequest as ServiceRequest
  }
  async findManyByAdvertisementIdAndRequesterId(advertisementId: string, requesterId: string) { return this.items.filter(x => x.advertisementId === advertisementId && x.requesterId === requesterId) }
  async updateStatus(id: string, status: ServiceRequest['status']) { const x = this.items.find(x => x.id === id); if (!x) throw new Error('Not found'); x.status = status; x.updated_at = new Date(); return x }
  async delete(id: string) { this.items = this.items.filter(x => x.id !== id) }
}
