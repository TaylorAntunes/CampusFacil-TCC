import { FastifyRequest, FastifyReply } from 'fastify'
import { GetUserProfileService } from '@/services/get-user-profile'
import { PrismaUserProfileRepository } from '@/repositories/prisma/prisma-user-profile-repository'
import { serializeUserProfile } from '@/utils/serialize-user-profile'

export async function profile(request: FastifyRequest, reply: FastifyReply) {
  const userProfileRepository = new PrismaUserProfileRepository()
  const getUserProfile = new GetUserProfileService(userProfileRepository)

  const user = await getUserProfile.execute({
    userId: request.user.sub,
  })

  if (!user) {
    return reply.status(404).send({ message: 'Usuário não encontrado' })
  }

  return reply.status(200).send({ user: serializeUserProfile(user) })
}
