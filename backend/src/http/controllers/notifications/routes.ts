import { FastifyInstance } from 'fastify'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { create } from './create'
import { fetchByUser } from './fetch-by-user'
import { markAsRead } from './mark-as-read'
import { markAllAsRead } from './mark-all-as-read'
import { deleteNotification } from './delete'

export async function notificationsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.post('/notifications', create)
  app.get('/notifications/user', fetchByUser)
  app.patch('/notifications/:notificationId/read', markAsRead)
  app.patch('/notifications/read/all', markAllAsRead)
  app.delete('/notifications/:notificationId', deleteNotification)
}
