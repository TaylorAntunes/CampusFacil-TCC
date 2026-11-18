import { HttpError } from '@/services/errors/http-error'
export function imageExtension(buffer: Buffer, mime: string): string {
  if (mime === 'image/png' && buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return '.png'
  if (mime === 'image/jpeg' && buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) return '.jpg'
  if (mime === 'image/webp' && buffer.subarray(0,4).toString() === 'RIFF' && buffer.subarray(8,12).toString() === 'WEBP') return '.webp'
  throw new HttpError(400, 'Envie uma imagem PNG, JPEG ou WebP válida. SVG e conteúdo ativo não são permitidos.')
}
