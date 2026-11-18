import { FastifyInstance } from 'fastify'
import { getDashboardStatsController } from './get-dashboard-stats-controller'
import { getRecentActivityController } from './get-recent-activity-controller'
import { verifyJWT } from '../../middlewares/verify-jwt'

export async function dashboardRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.get('/dashboard/stats', getDashboardStatsController)
  app.get('/dashboard/recent-activity', getRecentActivityController)
}
