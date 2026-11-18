import { NotificationsRepository } from '@/repositories/notifications-repository'
import { ResourceNotFoundError } from '@/services/errors/resource-not-found-error'
import { NotAllowedError } from '@/services/errors/not-allowed-error'

interface DeleteNotificationServiceRequest {
  notificationId: string
  userId: string
}

export class DeleteNotificationService {
  constructor(private notificationsRepository: NotificationsRepository) {}

  async execute({
    notificationId,
    userId,
  }: DeleteNotificationServiceRequest): Promise<void> {
    const notification =
      await this.notificationsRepository.findById(notificationId)

    if (!notification) {
      throw new ResourceNotFoundError()
    }

    if (notification.recipientId !== userId) {
      throw new NotAllowedError()
    }

    await this.notificationsRepository.delete(notificationId)
  }
}
