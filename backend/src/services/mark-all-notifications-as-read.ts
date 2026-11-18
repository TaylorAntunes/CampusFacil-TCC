import { NotificationsRepository } from '@/repositories/notifications-repository'

interface MarkAllNotificationsAsReadServiceRequest {
  recipientId: string
}

export class MarkAllNotificationsAsReadService {
  constructor(private notificationsRepository: NotificationsRepository) {}

  async execute({
    recipientId,
  }: MarkAllNotificationsAsReadServiceRequest): Promise<void> {
    await this.notificationsRepository.markAllAsRead(recipientId)
  }
}
