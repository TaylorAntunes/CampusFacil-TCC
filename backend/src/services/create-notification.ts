import { Notification } from '@prisma/client'
import { NotificationsRepository } from '@/repositories/notifications-repository'

interface CreateNotificationServiceRequest {
  recipientId: string
  type: string
  message: string
  metadata?: object
}

interface CreateNotificationServiceResponse {
  notification: Notification
}

export class CreateNotificationService {
  constructor(private notificationsRepository: NotificationsRepository) {}

  async execute({
    recipientId,
    type,
    message,
    metadata,
  }: CreateNotificationServiceRequest): Promise<CreateNotificationServiceResponse> {
    const notification = await this.notificationsRepository.create({
      recipientId,
      type,
      message,
      metadata,
    })

    return { notification }
  }
}
