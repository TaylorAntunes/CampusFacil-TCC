import { HttpError } from './errors/http-error'
import { Notification } from '@prisma/client'
import { NotificationsRepository } from '@/repositories/notifications-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

interface MarkNotificationAsReadServiceRequest {
  notificationId: string
  userId: string
}

interface MarkNotificationAsReadServiceResponse {
  notification: Notification
}

export class MarkNotificationAsReadService {
  constructor(private notificationsRepository: NotificationsRepository) {}

  async execute({
    notificationId,
    userId,
  }: MarkNotificationAsReadServiceRequest): Promise<MarkNotificationAsReadServiceResponse> {
    const notification =
      await this.notificationsRepository.findById(notificationId)

    if (!notification) {
      throw new ResourceNotFoundError()
    }

    if (notification.recipientId !== userId) throw new HttpError(403, 'Você não pode alterar esta notificação.')
    const updated = await this.notificationsRepository.markAsRead(notificationId)
    return { notification: updated! }
  }
}
