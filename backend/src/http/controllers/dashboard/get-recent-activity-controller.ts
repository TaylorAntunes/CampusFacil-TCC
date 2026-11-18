import { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaRecentActivityRepository } from '../../../repositories/prisma/prisma-recent-activity-repository'
import { GetRecentActivityService } from '../../../services/get-recent-activity'

export async function getRecentActivityController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const recentActivityRepository = new PrismaRecentActivityRepository()
    const getRecentActivityService = new GetRecentActivityService(
      recentActivityRepository,
    )

    const activity = await getRecentActivityService.execute({
      userId: request.user.sub,
    })

    return reply.status(200).send(activity)
  } catch (error) {
    console.error('Erro ao buscar atividade recente:', error)
    return reply.status(500).send({ message: 'Erro interno do servidor' })
  }
}
