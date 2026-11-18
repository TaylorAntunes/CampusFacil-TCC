import { serializeUserProfile } from '@/utils/serialize-user-profile'
import { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaUsersRepository } from '../../../repositories/prisma/prisma-users-repository'

export async function getSellersController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const usersRepository = new PrismaUsersRepository()
  // Aqui você pode filtrar por role, status, etc. Exemplo: role: 'SELLER'
  const sellers = (await usersRepository.findAllSellers?.()) || []
  return reply.status(200).send({ sellers: sellers.map(serializeUserProfile) })
}
