import { Prisma, Notification } from '@prisma/client'
import { NotificationsRepository } from '../notifications-repository'

export class InMemoryNotificationsRepository
  implements NotificationsRepository
{
  public items: Notification[] = []

  async create(data: Prisma.NotificationUncheckedCreateInput) {
    const notification = {
      id: data.id ?? 'notification-1',
      recipientId: data.recipientId,
      type: data.type,
      message: data.message,
      read: data.read ?? false,
      created_at: new Date(),
    }

    this.items.push(notification as Notification)

    return notification as Notification
  }

  async findByRecipientId(recipientId: string) {
    return this.items.filter((item) => item.recipientId === recipientId)
  }

  async markAsRead(notificationId: string) {
    const notificationIndex = this.items.findIndex(
      (item) => item.id === notificationId,
    )

    if (notificationIndex === -1) {
      return null
    }

    this.items[notificationIndex].read = true

    return this.items[notificationIndex]
  }
  async findById(id: string) { return this.items.find(x => x.id === id) ?? null }
  async delete(id: string) { this.items = this.items.filter(x => x.id !== id) }
  async markAllAsRead(recipientId: string) { let count = 0; for (const x of this.items) if (x.recipientId === recipientId && !x.read) { x.read = true; count++ } return { count } }
}
