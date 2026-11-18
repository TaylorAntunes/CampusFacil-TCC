import api from './api';

export interface Notification {
  id: string;
  type: string;
  message: string;
  metadata?: Record<string, any>;
  read: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

function normalizeNotification(notification: any): Notification {
  return {
    ...notification,
    userId: notification.userId ?? notification.recipientId,
    createdAt:
      notification.createdAt ??
      notification.created_at ??
      notification.updatedAt ??
      notification.updated_at ??
      new Date().toISOString(),
    updatedAt:
      notification.updatedAt ??
      notification.updated_at ??
      notification.createdAt ??
      notification.created_at ??
      new Date().toISOString(),
  };
}

export const notificationsService = {
  async getUserNotifications(): Promise<{ notifications: Notification[] }> {
    const response = await api.get('/notifications/user');
    return {
      notifications: (response.data.notifications ?? []).map(normalizeNotification),
    };
  },

  async markAsRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/read/all');
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },

  async create(params: { recipientId: string; type: string; message: string; metadata?: Record<string, any> }): Promise<void> {
    await api.post('/notifications', params);
  },

  normalizeNotification,
};
