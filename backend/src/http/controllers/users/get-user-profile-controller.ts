import { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaUserProfileRepository } from '../../../repositories/prisma/prisma-user-profile-repository'
import { GetUserProfileService } from '../../../services/get-user-profile'
import { serializeUserProfile } from '@/utils/serialize-user-profile'

export async function getUserProfileController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const userProfileRepository = new PrismaUserProfileRepository()
  const getUserProfileService = new GetUserProfileService(userProfileRepository)

  const userProfile = await getUserProfileService.execute({
    userId: request.user.sub,
  })

  if (!userProfile) {
    return reply.status(404).send({ message: 'Usuário não encontrado' })
  }

  return reply.status(200).send(serializeUserProfile(userProfile))
}
