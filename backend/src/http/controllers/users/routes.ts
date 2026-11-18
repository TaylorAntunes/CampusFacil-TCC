import { verifyEmail, resendVerification } from './email-verification'
import { logout } from './logout'
import { FastifyInstance } from 'fastify'
import { register } from './register'
import { authenticate } from './authenticate'
import { getUserProfileController } from './get-user-profile-controller'
import { updateUserProfileController } from './update-user-profile-controller'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { fetchTransactionHistory } from './fetch-transaction-history'
import { fetchUserServiceRequestsController } from './get-user-service-requests-controller'
import { uploadAvatarController } from './upload-avatar-controller'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/users', register)
  app.post('/users/verify-email', verifyEmail)
  app.post('/users/resend-verification', resendVerification)
  app.post('/sessions/logout', { onRequest: [verifyJWT] }, logout)
  app.post('/sessions', authenticate)

  app.get('/me', { onRequest: [verifyJWT] }, getUserProfileController)
  app.put('/me', { onRequest: [verifyJWT] }, updateUserProfileController)
  app.get('/users/history', { onRequest: [verifyJWT] }, fetchTransactionHistory)
  app.get(
    '/users/orders',
    { onRequest: [verifyJWT] },
    fetchUserServiceRequestsController,
  )
  app.post('/users/avatar', { onRequest: [verifyJWT] }, uploadAvatarController)
}
