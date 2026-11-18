import { PrismaServiceRequestsRepository } from '@/repositories/prisma/prisma-service-requests-repository'
import { PrismaNotificationsRepository } from '@/repositories/prisma/prisma-notifications-repository'
import { PrismaAdvertisementsRepository } from '@/repositories/prisma/prisma-advertisements-repository'
import { UpdateServiceRequestStatusService } from '@/services/update-service-request-status'
import { Server } from 'socket.io'

export function makeUpdateServiceRequestStatusService(io: Server) {
  const serviceRequestsRepository = new PrismaServiceRequestsRepository()
  const notificationsRepository = new PrismaNotificationsRepository()
  const advertisementsRepository = new PrismaAdvertisementsRepository()
  const service = new UpdateServiceRequestStatusService(
    serviceRequestsRepository,
    notificationsRepository,
    advertisementsRepository,
    io,
  )

  return service
}
