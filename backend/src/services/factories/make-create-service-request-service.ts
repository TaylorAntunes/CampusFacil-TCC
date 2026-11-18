import { Server } from 'socket.io'
import { CreateServiceRequestService } from '@/services/create-service-request'
import { PrismaServiceRequestsRepository } from '@/repositories/prisma/prisma-service-requests-repository'
import { PrismaAdvertisementsRepository } from '@/repositories/prisma/prisma-advertisements-repository'
import { PrismaNotificationsRepository } from '@/repositories/prisma/prisma-notifications-repository'

export function makeCreateServiceRequestService(io: Server) {
  const serviceRequestsRepository = new PrismaServiceRequestsRepository()
  const advertisementsRepository = new PrismaAdvertisementsRepository()
  const notificationsRepository = new PrismaNotificationsRepository()

  const service = new CreateServiceRequestService(
    serviceRequestsRepository,
    advertisementsRepository,
    notificationsRepository,
    io,
  )

  return service
}
