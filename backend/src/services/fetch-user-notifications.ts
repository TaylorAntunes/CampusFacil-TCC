import { Notification } from '@prisma/client'
import { NotificationsRepository } from '@/repositories/notifications-repository'

interface FetchUserNotificationsServiceRequest {
  recipientId: string
}

interface FetchUserNotificationsServiceResponse {
  notifications: Notification[]
}

export class FetchUserNotificationsService {
  constructor(private notificationsRepository: NotificationsRepository) {}

  async execute({
    recipientId,
  }: FetchUserNotificationsServiceRequest): Promise<FetchUserNotificationsServiceResponse> {
    const notifications =
      await this.notificationsRepository.findByRecipientId(recipientId)

    return { notifications }
  }
}
