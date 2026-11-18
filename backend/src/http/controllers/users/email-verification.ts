import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { confirmEmail, sendVerificationEmail } from '@/services/email-verification'
export async function verifyEmail(request: FastifyRequest, reply: FastifyReply) {
  const { token } = z.object({ token: z.string().regex(/^[a-f0-9]{64}$/) }).parse(request.body)
  await confirmEmail(token)
  return reply.send({ message: 'E-mail confirmado. Você já pode entrar.' })
}
export async function resendVerification(request: FastifyRequest, reply: FastifyReply) {
  const { email } = z.object({ email: z.string().trim().toLowerCase().pipe(z.email()) }).parse(request.body)
  const user = await prisma.user.findUnique({ where: { email } })
  if (user) await sendVerificationEmail(user.id)
  return reply.send({ message: 'Se houver uma conta pendente para esse e-mail, a confirmação será enviada.' })
}
