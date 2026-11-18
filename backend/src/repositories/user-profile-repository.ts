import { Prisma, User } from '@prisma/client'

export type UpdateUserProfileData = Pick<
  Prisma.UserUpdateInput,
  | 'name'
  | 'course'
  | 'semester'
  | 'bio'
  | 'avatar_url'
  | 'location'
  | 'response_time'
  | 'skills'
>

export interface UserProfileRepository {
  getProfile(userId: string): Promise<User | null>
  updateProfile(userId: string, data: UpdateUserProfileData): Promise<User>
}
