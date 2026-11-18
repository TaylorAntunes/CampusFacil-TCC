import { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../../../lib/prisma'

export async function getCategoriesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const categories = await prisma.category.findMany()

  return reply.status(200).send(categories)
}
