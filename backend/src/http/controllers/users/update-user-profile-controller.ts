import { userNameSchema } from '@/utils/user-name-schema'
import { FastifyRequest, FastifyReply } from 'fastify'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { PrismaUserProfileRepository } from '../../../repositories/prisma/prisma-user-profile-repository'
import { UpdateUserProfileService } from '../../../services/update-user-profile'
import { serializeUserProfile } from '@/utils/serialize-user-profile'

export async function updateUserProfileController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const updateUserProfileBodySchema = z.object({
    name: userNameSchema.optional(),
    course: z.string().optional(),
    semester: z.string().optional(),
    bio: z.string().optional(),
    avatar_url: z.string().optional(),
    location: z.string().optional(),
    response_time: z.string().optional(),
    skills: z.array(z.string()).optional(),
  })

  const { name, course, semester, bio, avatar_url, location, response_time, skills } =
    updateUserProfileBodySchema.parse(request.body)

  const userProfileRepository = new PrismaUserProfileRepository()
  const updateUserProfileService = new UpdateUserProfileService(
    userProfileRepository,
  )

  try {
    const userProfile = await updateUserProfileService.execute({
      userId: request.user.sub,
      data: { name, course, semester, bio, avatar_url, location, response_time, skills },
    })

    return reply.status(200).send(serializeUserProfile(userProfile))
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2022'
    ) {
      return reply.status(503).send({
        message:
          'O banco ainda nao foi atualizado para os novos campos do perfil. Execute as migrations do Prisma e tente novamente.',
      })
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return reply.status(503).send({
        message:
          'Nao foi possivel conectar ao banco de dados. Verifique se o Postgres esta ativo e tente novamente.',
      })
    }

    throw error
  }
}
