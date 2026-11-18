import { Prisma, RequestStatus, ServiceRequest } from '@prisma/client'

export interface ServiceRequestsRepository {
  create(
    data: Prisma.ServiceRequestUncheckedCreateInput,
  ): Promise<ServiceRequest>
  findById(id: string): Promise<ServiceRequest | null>
  findByAdvertisementId(advertisementId: string): Promise<ServiceRequest[]>
  findByRequesterId(requesterId: string): Promise<ServiceRequest[]>
  findManyByUserId(userId: string): Promise<ServiceRequest[]>
  findManyByAdvertisementIdAndRequesterId(
    advertisementId: string,
    requesterId: string,
  ): Promise<ServiceRequest[]>
  updateStatus(
    serviceRequestId: string,
    status: RequestStatus,
  ): Promise<ServiceRequest>
  delete(serviceRequestId: string): Promise<void>
  save(serviceRequest: ServiceRequest): Promise<ServiceRequest>
}
