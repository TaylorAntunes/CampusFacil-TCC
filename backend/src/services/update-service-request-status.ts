import { ServiceRequest, RequestStatus } from '@prisma/client'
import { ServiceRequestsRepository } from '@/repositories/service-requests-repository'
import { NotificationsRepository } from '@/repositories/notifications-repository'
import { AdvertisementsRepository } from '@/repositories/advertisements-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { Server } from 'socket.io'

interface UpdateServiceRequestStatusServiceRequest {
  serviceRequestId: string
  status: RequestStatus
  actorUserId: string
}

interface UpdateServiceRequestStatusServiceResponse {
  serviceRequest: ServiceRequest
}

export class UpdateServiceRequestStatusService {
  constructor(
    private serviceRequestsRepository: ServiceRequestsRepository,
    private notificationsRepository: NotificationsRepository,
    private advertisementsRepository: AdvertisementsRepository,
    private io: Server,
  ) {}

  async execute({
    serviceRequestId,
    status,
    actorUserId,
  }: UpdateServiceRequestStatusServiceRequest): Promise<UpdateServiceRequestStatusServiceResponse> {
    const serviceRequest =
      await this.serviceRequestsRepository.findById(serviceRequestId)

    if (!serviceRequest) {
      throw new ResourceNotFoundError()
    }

    let advertisementAuthorId: string | undefined
    if (serviceRequest.advertisementId) {
      const advertisement = await this.advertisementsRepository.findById(
        serviceRequest.advertisementId,
      )
      advertisementAuthorId = advertisement?.authorId
    }

    const isRequester = serviceRequest.requesterId === actorUserId
    const isProvider = advertisementAuthorId === actorUserId

    if (!isRequester && !isProvider) {
      throw new Error('Unauthorized')
    }

    const allowedTransitionsByActor: Partial<
      Record<RequestStatus, RequestStatus[]>
    > = isProvider
      ? {
          PENDING: ['ACCEPTED', 'REJECTED'],
        }
      : {
          PENDING: ['CANCELLED'],
          ACCEPTED: ['IN_PROGRESS', 'CANCELLED'],
          IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
        }

    const allowedStatuses = allowedTransitionsByActor[serviceRequest.status] ?? []

    if (!allowedStatuses.includes(status)) {
      throw new Error('Invalid status transition')
    }

    const updatedServiceRequest =
      await this.serviceRequestsRepository.updateStatus(
        serviceRequestId,
        status,
      )

    if (status === 'ACCEPTED') {
      let advertisementTitle = 'seu serviço'
      if (updatedServiceRequest.advertisementId) {
        const advertisement = await this.advertisementsRepository.findById(
          updatedServiceRequest.advertisementId,
        )
        if (advertisement) {
          advertisementTitle = `"${advertisement.title}"`
        }
      }

      const notification = await this.notificationsRepository.create({
        recipientId: updatedServiceRequest.requesterId,
        type: 'service_request_accepted',
        message: `Sua solicitação para ${advertisementTitle} foi aceita!`,
        metadata: {
          advertisementId: updatedServiceRequest.advertisementId,
        },
      })

      this.io
        .to(updatedServiceRequest.requesterId)
        .emit('new_notification', notification)
    }

    if (status === 'IN_PROGRESS') {
      let advertisementTitle = 'seu serviço'
      if (updatedServiceRequest.advertisementId) {
        const advertisement = await this.advertisementsRepository.findById(
          updatedServiceRequest.advertisementId,
        )
        if (advertisement) {
          advertisementTitle = `"${advertisement.title}"`
        }
      }

      if (advertisementAuthorId) {
        const notification = await this.notificationsRepository.create({
          recipientId: advertisementAuthorId,
          type: 'service_request_started',
          message: `O cliente confirmou e iniciou o pedido para ${advertisementTitle}.`,
          metadata: {
            advertisementId: updatedServiceRequest.advertisementId,
            serviceRequestId: updatedServiceRequest.id,
          },
        })

        this.io.to(advertisementAuthorId).emit('new_notification', notification)
      }
    }

    return { serviceRequest: updatedServiceRequest }
  }
}
