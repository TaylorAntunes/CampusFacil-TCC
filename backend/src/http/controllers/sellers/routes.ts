import { FastifyInstance } from 'fastify'
import { getSellersController } from './get-sellers-controller'
import { getSellerProfileController } from './get-seller-profile-controller'

export async function sellersRoutes(app: FastifyInstance) {
  app.get('/:sellerId', getSellerProfileController)
  app.get('/', getSellersController)
}
