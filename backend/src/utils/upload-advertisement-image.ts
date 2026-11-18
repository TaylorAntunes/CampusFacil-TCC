import { randomUUID } from 'node:crypto'
import { FastifyRequest } from 'fastify'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { imageExtension } from './safe-image'
import { HttpError } from '@/services/errors/http-error'
export async function saveUploadedAdvertisementImage(request: FastifyRequest): Promise<string | undefined> {
  if (!request.isMultipart?.()) return undefined
  const body = request.body as Record<string, any> | undefined
  const field = body?.image
  if (field && typeof field === 'object' && typeof field.toBuffer === 'function') {
    const buffer = await field.toBuffer()
    if (buffer.length > 10 * 1024 * 1024) throw new HttpError(413, 'A imagem excede 10 MB.')
    const extension = imageExtension(buffer, field.mimetype)
    const uploadDir = path.resolve(process.cwd(), 'uploads')
    await fs.mkdir(uploadDir, { recursive: true })
    const filename = randomUUID() + extension
    await fs.writeFile(path.join(uploadDir, filename), buffer)
    return '/uploads/' + filename
  }
  return undefined
}
