import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeGetSellerProfileService } from '@/services/factories/make-get-seller-profile-service'
import { serializeUserProfile } from '@/utils/serialize-user-profile'

export async function getSellerProfileController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    sellerId: z.string().uuid(),
  })

  const { sellerId } = paramsSchema.parse(request.params)

  const service = makeGetSellerProfileService()
  const { seller, advertisements } = await service.execute(sellerId)

  return reply.status(200).send({
    seller: serializeUserProfile(seller),
    advertisements,
  })
}
