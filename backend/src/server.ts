import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { validSession } from './services/session'
import fastify from 'fastify'
import { env } from './env'
import { advertisementsRoutes } from './http/controllers/advertisements/routes'
import { usersRoutes } from './http/controllers/users/routes'
import { serviceRequestsRoutes } from './http/controllers/service-requests/routes'
import { reviewsRoutes } from './http/controllers/reviews/routes'
import { notificationsRoutes } from './http/controllers/notifications/routes'
import { dashboardRoutes } from './http/controllers/dashboard/routes'
import { sellersRoutes } from './http/controllers/sellers/routes'
import { categoriesRoutes } from './http/controllers/categories/routes'
import { messagesRoutes } from './http/controllers/messages/routes'
import jwt from '@fastify/jwt'
import cookie from '@fastify/cookie'
import multipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import { Server } from 'socket.io'
import * as path from 'node:path'

const MAX_AVATAR_SIZE_BYTES = 10 * 1024 * 1024

const app = fastify({
  bodyLimit: MAX_AVATAR_SIZE_BYTES,
})

app.setErrorHandler((error, request, reply) => {
  if (error instanceof z.ZodError) return reply.status(400).send({ message: 'Dados inválidos.', issues: error.flatten() })
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') return reply.status(409).send({ message: 'Este registro já existe.' })
    if (['P2003', 'P2025'].includes(error.code)) return reply.status(404).send({ message: 'Registro relacionado não encontrado.' })
  }
  const messages: Record<string, number> = { 'Unauthorized': 403, 'Not allowed.': 403, 'Service already requested.': 409, 'Resource not found.': 404 }
  const status = messages[error.message] || error.statusCode || 500
  return reply.status(status).send({ message: status >= 500 ? 'Erro interno ao processar a solicitação.' : error.message })
})

const corsHeaders = {
  'Access-Control-Allow-Origin': env.CORS_ORIGIN,
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
}

app.addHook('onRequest', (request, reply, done) => {
  Object.entries(corsHeaders).forEach(([name, value]) => {
    reply.header(name, value)
  })

  if (request.method === 'OPTIONS') {
    reply.status(204).send()
    return
  }

  done()
})

const io = new Server(app.server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token
    if (typeof token !== 'string') throw new Error('Unauthorized')
    const payload = app.jwt.verify<{ sub: string; sid: string }>(token)
    if (!await validSession(payload)) throw new Error('Unauthorized')
    if (socket.handshake.auth.userId && socket.handshake.auth.userId !== payload.sub) throw new Error('Unauthorized')
    socket.data.userId = payload.sub
    socket.data.sessionId = payload.sid
    next()
  } catch { next(new Error('Unauthorized')) }
})
app.decorate('io', io)

app.register(jwt, {
  secret: env.JWT_SECRET,
  cookie: {
    cookieName: 'refreshToken',
    signed: false,
  },
  sign: {
    expiresIn: '24h',
  },
})
app.register(cookie)
app.register(multipart, {
  attachFieldsToBody: true,
  limits: {
    fileSize: MAX_AVATAR_SIZE_BYTES,
  },
})

// Register fastify-static to serve uploaded files
app.register(fastifyStatic, {
  root: path.resolve(process.cwd(), 'uploads'),
  setHeaders: (response) => {
    response.setHeader('X-Content-Type-Options', 'nosniff')
    response.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; sandbox")
  },
  prefix: '/uploads/', // Serve files under the /uploads route
})

app.register(usersRoutes, { prefix: '/api' })
app.register(advertisementsRoutes, { prefix: '/api' })
app.register(serviceRequestsRoutes, { prefix: '/api' })
app.register(reviewsRoutes, { prefix: '/api' })
app.register(notificationsRoutes, { prefix: '/api' })
app.register(dashboardRoutes, { prefix: '/api' })
app.register(categoriesRoutes, { prefix: '/api' })
app.register(messagesRoutes, { prefix: '/api' })

app.register(sellersRoutes, { prefix: '/api/sellers' })

app
  .listen({
    host: env.HOST,
    port: env.PORT,
  })
  .then((address) => {
    console.log(`HTTP Server Running on ${address}`)

    io.on('connection', (socket) => {
      socket.join(socket.data.userId)
      socket.join('session:' + socket.data.sessionId)

      socket.on('disconnect', () => {
        console.log('user disconnected', socket.id)
      })
    })
  })
  .catch((error) => {
    console.error('Não foi possível iniciar o servidor.', error)
    process.exit(1)
  })
