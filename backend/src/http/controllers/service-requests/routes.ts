import { FastifyInstance } from 'fastify'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { updateStatusController } from './update-status-controller'
import { deleteController } from './delete-controller'
import { create } from './create'

export async function serviceRequestsRoutes(app: FastifyInstance) {
  app.post('/service-requests', { onRequest: [verifyJWT] }, create)
  app.patch(
    '/service-requests/:serviceRequestId/status',
    { onRequest: [verifyJWT] },
    updateStatusController,
  )
  app.delete(
    '/service-requests/:serviceRequestId',
    { onRequest: [verifyJWT] },
    deleteController,
  )
}
