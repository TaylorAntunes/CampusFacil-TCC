import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/services/email-verification'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository'
import { AuthenticateService } from '@/services/authenticate'
import { InvalidCredentialsError } from '@/services/errors/invalid-credentials-error'

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const authenticateBodySchema = z.object({
    email: z.string().trim().toLowerCase().pipe(z.email()),
    password: z.string().min(6),
  })

  const { email, password } = authenticateBodySchema.parse(request.body)

  try {
    const usersRepository = new PrismaUsersRepository()
    const authenticateService = new AuthenticateService(usersRepository)

    const { user } = await authenticateService.execute({
      email,
      password,
    })

    if (!user.email_verified_at) {
      await sendVerificationEmail(user.id)
      return reply.status(403).send({ code: 'EMAIL_NOT_VERIFIED', message: 'Confirme seu e-mail institucional antes de entrar.' })
    }
    const session = await prisma.session.create({ data: { userId: user.id, expiresAt: new Date(Date.now() + 24 * 60 * 60_000) } })
    const token = await reply.jwtSign(
      { sid: session.id },
      {
        sign: {
          sub: user.id,
        },
      },
    )

    const refreshToken = await reply.jwtSign(
      {},
      {
        sign: {
          sub: user.id,
          expiresIn: '24h',
        },
      },
    )

    return reply
      .setCookie('refreshToken', refreshToken, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        httpOnly: true,
      })
      .status(200)
      .send({ token })
  } catch (err) {
    if (err instanceof InvalidCredentialsError) {
      return reply.status(400).send({ message: err.message })
    }

    throw err
  }
}
