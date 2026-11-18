import { User } from '@prisma/client'
export type PublicUserProfile = Omit<User, 'password_hash' | 'verification_token_hash' | 'verification_expires_at'>
export function serializeUserProfile(user: User): PublicUserProfile {
  const { password_hash, verification_token_hash, verification_expires_at, ...publicUser } = user
  return publicUser
}
