import { FastifyInstance } from 'fastify'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { create } from './create'
import { getReviewsByAdvertisementController } from './get-reviews-by-advertisement-controller'

import { getReviewsByReviewerController } from './get-reviews-by-reviewer-controller'

export async function reviewsRoutes(app: FastifyInstance) {
  app.get(
    '/advertisements/:advertisementId/reviews',
    getReviewsByAdvertisementController,
  )

  app.addHook('onRequest', verifyJWT)

  app.get('/reviews', getReviewsByReviewerController)
  app.post('/reviews', create)
}
