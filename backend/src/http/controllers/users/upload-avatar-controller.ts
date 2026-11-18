import { imageExtension } from '@/utils/safe-image'
import { serializeUserProfile } from '@/utils/serialize-user-profile'
import { FastifyRequest, FastifyReply } from 'fastify'
import { pipeline } from 'stream/promises'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { randomUUID } from 'node:crypto'
import { UploadAvatarService } from '../../../services/upload-avatar'
import { PrismaUserProfileRepository } from '../../../repositories/prisma/prisma-user-profile-repository'

const MAX_AVATAR_SIZE_BYTES = 10 * 1024 * 1024

export async function uploadAvatarController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  let data: any

  try {
    data = await request.file()
  } catch (error: any) {
    if (
      error?.statusCode === 413 ||
      error?.code === 'FST_REQ_FILE_TOO_LARGE' ||
      error?.message?.includes('request file too large')
    ) {
      return reply.status(413).send({
        message: 'A imagem excede o limite de 10 MB.',
      })
    }

    throw error
  }

  if (!data) {
    const bodyFile = (request.body as { file?: unknown } | undefined)?.file
    if (bodyFile) {
      data = bodyFile
    }
  }

  if (!data) {
    return reply.status(400).send({ message: 'Nenhum arquivo enviado.' })
  }

  const { filename, mimetype } = data

  if (!mimetype || !mimetype.includes('image')) {
    return reply.status(400).send({
      message: 'Tipo de arquivo invalido. Apenas imagens sao permitidas.',
    })
  }

  if (typeof data.file?.bytesRead === 'number' && data.file.bytesRead > MAX_AVATAR_SIZE_BYTES) {
    return reply.status(413).send({
      message: 'A imagem excede o limite de 10 MB.',
    })
  }

  const imageBuffer = await data.toBuffer()
  const fileExtension = imageExtension(imageBuffer, mimetype)
  const newFilename = `${randomUUID()}${fileExtension}`
  const uploadDir = path.resolve(process.cwd(), 'uploads')

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  const filePath = path.resolve(uploadDir, newFilename)

  if (typeof data.toBuffer === 'function') {
    const buffer = imageBuffer

    if (buffer.byteLength > MAX_AVATAR_SIZE_BYTES) {
      return reply.status(413).send({
        message: 'A imagem excede o limite de 10 MB.',
      })
    }

    await fs.promises.writeFile(filePath, buffer)
  } else {
    await pipeline(data.file, fs.createWriteStream(filePath))
  }

  const avatar_url = `/uploads/${newFilename}`

  const userProfileRepository = new PrismaUserProfileRepository()
  const uploadAvatarService = new UploadAvatarService(userProfileRepository)

  const userProfile = await uploadAvatarService.execute({
    userId: request.user.sub,
    avatar_url,
  })

  return reply.status(200).send(serializeUserProfile(userProfile))
}
