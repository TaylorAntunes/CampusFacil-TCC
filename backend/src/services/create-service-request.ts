import { HttpError } from './errors/http-error'
import { ServiceRequest } from '@prisma/client'
import { ServiceRequestsRepository } from '@/repositories/service-requests-repository'
import { AdvertisementsRepository } from '@/repositories/advertisements-repository'
import { NotificationsRepository } from '@/repositories/notifications-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { ServiceAlreadyRequestedError } from './errors/service-already-requested-error'
import { Server } from 'socket.io'

interface CreateServiceRequestServiceRequest {
  advertisementId?: string
  requesterId: string
  message: string
}

interface CreateServiceRequestServiceResponse {
  serviceRequest: ServiceRequest
}

export class CreateServiceRequestService {
  constructor(
    private serviceRequestsRepository: ServiceRequestsRepository,
    private advertisementsRepository: AdvertisementsRepository,
    private notificationsRepository: NotificationsRepository,
    private io: Server,
  ) {}
  async execute({
    advertisementId,
    requesterId,
    message,
  }: CreateServiceRequestServiceRequest): Promise<CreateServiceRequestServiceResponse> {
    if (advertisementId) {
      const existingServiceRequests =
        await this.serviceRequestsRepository.findManyByAdvertisementIdAndRequesterId(
          advertisementId,
          requesterId,
        )

      const hasActiveServiceRequest = existingServiceRequests.some(
        (request) =>
          request.status === 'PENDING' ||
          request.status === 'ACCEPTED' ||
          request.status === 'IN_PROGRESS',
      )

      if (hasActiveServiceRequest) {
        throw new ServiceAlreadyRequestedError()
      }

      const advertisement =
        await this.advertisementsRepository.findById(advertisementId)

      if (!advertisement) {
        throw new ResourceNotFoundError()
      }

      if (advertisement.authorId === requesterId) throw new HttpError(403, 'Não é permitido solicitar seu próprio serviço.')

      const serviceRequest = await this.serviceRequestsRepository.create({
        advertisementId: advertisementId || null,
        requesterId,
        message,
      })

      const notification = await this.notificationsRepository.create({
        recipientId: advertisement.authorId,
        type: 'service_request',
        message: `Você recebeu uma nova solicitação de serviço para o anúncio "${advertisement.title}".`,
        metadata: {
          advertisementId: advertisement.id,
          serviceRequestId: serviceRequest.id,
        },
      })

      this.io.to(advertisement.authorId).emit('new_notification', notification)

      return { serviceRequest }
    }

    const serviceRequest = await this.serviceRequestsRepository.create({
      advertisementId: advertisementId || null,
      requesterId,
      message,
    })

    return { serviceRequest }
  }
}
