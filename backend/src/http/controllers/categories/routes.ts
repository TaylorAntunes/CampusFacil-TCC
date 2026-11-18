import { FastifyInstance } from 'fastify'
import { getCategoriesController } from './get-categories-controller'

export async function categoriesRoutes(app: FastifyInstance) {
  app.get('/categories', getCategoriesController)
}
