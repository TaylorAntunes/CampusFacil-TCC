import { prisma } from '@/lib/prisma'
import { Prisma, Notification } from '@prisma/client'
import { NotificationsRepository } from '../notifications-repository'

export class PrismaNotificationsRepository implements NotificationsRepository {
  async create(data: Prisma.NotificationUncheckedCreateInput) {
    const notification = await prisma.notification.create({
      data,
    })

    return notification
  }

  async findByRecipientId(recipientId: string) {
    const notifications = await prisma.notification.findMany({
      where: {
        recipientId,
      },
    })

    return notifications
  }

  async markAsRead(notificationId: string) {
    const notification = await prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        read: true,
      },
    })

    return notification
  }

  async markAllAsRead(recipientId: string) {
    return prisma.notification.updateMany({
      where: { recipientId },
      data: { read: true },
    })
  }

  async findById(notificationId: string) {
    return prisma.notification.findUnique({
      where: { id: notificationId },
    })
  }

  async delete(notificationId: string) {
    await prisma.notification.delete({
      where: { id: notificationId },
    })
  }
}
