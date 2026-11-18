import { Prisma, Notification } from '@prisma/client'

export interface NotificationsRepository {
  create(data: Prisma.NotificationUncheckedCreateInput): Promise<Notification>
  findByRecipientId(recipientId: string): Promise<Notification[]>
  markAsRead(notificationId: string): Promise<Notification | null>
  markAllAsRead(recipientId: string): Promise<{ count: number }>
  findById(notificationId: string): Promise<Notification | null>
  delete(notificationId: string): Promise<void>
}
