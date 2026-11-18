import { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaDashboardRepository } from '../../../repositories/prisma/prisma-dashboard-repository'
import { GetDashboardStatsService } from '../../../services/get-dashboard-stats'

export async function getDashboardStatsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const dashboardRepository = new PrismaDashboardRepository()
  const getDashboardStatsService = new GetDashboardStatsService(
    dashboardRepository,
  )

  const stats = await getDashboardStatsService.execute({
    userId: request.user.sub,
  })

  return reply.status(200).send(stats)
}
