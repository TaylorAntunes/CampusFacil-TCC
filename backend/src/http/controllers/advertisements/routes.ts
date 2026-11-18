import { FastifyInstance } from 'fastify'
import { create } from './create'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { search } from './search'
import { fetchByUser } from './fetch-by-user'
import { update } from './update'
import { deleteAdvertisement } from './delete'
import { toggleAvailability } from './toggle-availability'
import { createRequest } from './create-request'
import { fetchAdvertisementServiceRequestsController } from './fetch-advertisement-service-requests-controller'
import { getById } from './get-by-id'

export async function advertisementsRoutes(app: FastifyInstance) {
  app.get('/advertisements', search)
  app.get('/advertisements/:advertisementId', getById)
  app.post('/advertisements', { onRequest: [verifyJWT] }, create)
  app.post(
    '/advertisements/:advertisementId/requests',
    { onRequest: [verifyJWT] },
    createRequest,
  )
  app.put(
    '/advertisements/:advertisementId',
    { onRequest: [verifyJWT] },
    update,
  )
  app.delete(
    '/advertisements/:advertisementId',
    { onRequest: [verifyJWT] },
    deleteAdvertisement,
  )
  app.patch(
    '/advertisements/:advertisementId/toggle-availability',
    { onRequest: [verifyJWT] },
    toggleAvailability,
  )
  app.get('/advertisements/user', { onRequest: [verifyJWT] }, fetchByUser)
  app.get(
    '/advertisements/:advertisementId/service-requests',
    { onRequest: [verifyJWT] },
    fetchAdvertisementServiceRequestsController,
  )
}
