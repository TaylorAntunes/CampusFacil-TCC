import { FastifyInstance } from 'fastify'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { fetchConversations } from './fetch-conversations'
import { fetchThread } from './fetch-thread'
import { sendMessage } from './send-message'
import { markThreadAsRead } from './mark-thread-as-read'

export async function messagesRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.get('/messages', fetchConversations)
  app.get('/messages/:participantId', fetchThread)
  app.post('/messages', sendMessage)
  app.patch('/messages/:participantId/read', markThreadAsRead)
}
