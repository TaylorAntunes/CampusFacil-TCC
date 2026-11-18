import { createHash, randomBytes, randomUUID } from 'node:crypto'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import nodemailer from 'nodemailer'
import { prisma } from '@/lib/prisma'
import { HttpError } from './errors/http-error'
const digest = (value: string) => createHash('sha256').update(value).digest('hex')

export async function sendVerificationEmail(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || user.email_verified_at) return
  // Avoid issuing many links on repeated requests. Never return the token over HTTP.
  if (user.verification_expires_at && user.verification_expires_at.getTime() > Date.now() + 25 * 60_000) return
  const token = randomBytes(32).toString('hex')
  const origin = process.env.CORS_ORIGIN || 'http://localhost:5173'
  const url = origin + '/verify-email?token=' + token
  const mode = process.env.EMAIL_DELIVERY || (process.env.NODE_ENV === 'production' ? 'smtp' : 'local')
  if (mode === 'local' && process.env.NODE_ENV === 'production') throw new HttpError(503, 'Entrega local de e-mail não é permitida em produção.')
  if (mode === 'smtp' && !process.env.SMTP_HOST) throw new HttpError(503, 'O envio de e-mail institucional ainda não foi configurado.')
  await prisma.user.update({ where: { id: userId }, data: { verification_token_hash: digest(token), verification_expires_at: new Date(Date.now() + 30 * 60_000) } })
  const text = 'Confirme seu e-mail institucional para acessar o CampusFácil. Link válido por 30 minutos e de uso único:\n' + url
  try {
    if (mode === 'local') {
      const outbox = path.resolve(process.cwd(), '.local-mail')
      await fs.mkdir(outbox, { recursive: true })
      await fs.writeFile(path.join(outbox, randomUUID() + '.json'), JSON.stringify({ to: user.email, subject: 'Confirme seu e-mail — CampusFácil', text, verificationUrl: url, createdAt: new Date().toISOString() }, null, 2), { mode: 0o600 })
    } else {
      const transport = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: process.env.SMTP_SECURE === 'true', auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined })
      await transport.sendMail({ from: process.env.SMTP_FROM, to: user.email, subject: 'Confirme seu e-mail — CampusFácil', text })
    }
  } catch {
    await prisma.user.update({ where: { id: userId }, data: { verification_token_hash: null, verification_expires_at: null } })
    throw new HttpError(503, 'Não foi possível enviar a confirmação. Tente reenviar em alguns instantes.')
  }
}
export async function confirmEmail(token: string) {
  const result = await prisma.user.updateMany({ where: { verification_token_hash: digest(token), verification_expires_at: { gt: new Date() }, email_verified_at: null }, data: { email_verified_at: new Date(), verification_token_hash: null, verification_expires_at: null } })
  if (!result.count) throw new HttpError(400, 'Link inválido, expirado ou já utilizado. Solicite uma nova confirmação.')
}
