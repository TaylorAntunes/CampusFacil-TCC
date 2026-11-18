import { userNameSchema } from '@/utils/user-name-schema'
import { sendVerificationEmail } from '@/services/email-verification'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { RegisterService } from '@/services/register'
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository'
import { UserAlreadyExistsError } from '@/services/errors/user-already-exists-error'
import { InstitutionalEmailRequiredError } from '@/services/errors/institutional-email-required-error'

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const registerBodySchema = z.object({
    name: userNameSchema,
    email: z.string().trim().pipe(z.email()),
    password: z.string().min(8).max(128),
  })

  const { name, email, password } = registerBodySchema.parse(request.body)

  try {
    const usersRepository = new PrismaUsersRepository()
    const registerService = new RegisterService(usersRepository)

    const { user } = await registerService.execute({
      name,
      email,
      password,
    })
    await sendVerificationEmail(user.id)
  } catch (err) {
    if (err instanceof InstitutionalEmailRequiredError) {
      return reply.status(400).send({ message: err.message })
    }

    if (err instanceof UserAlreadyExistsError) {
      return reply.status(409).send({ message: err.message })
    }

    throw err
  }

  return reply.status(201).send({ message: 'Conta criada. Confirme seu e-mail institucional para entrar.', requiresEmailVerification: true })
}
