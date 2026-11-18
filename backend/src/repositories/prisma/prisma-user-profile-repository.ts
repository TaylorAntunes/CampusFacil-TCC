import { prisma } from '@/lib/prisma'
import { User } from '@prisma/client'
import {
  UpdateUserProfileData,
  UserProfileRepository,
} from '../user-profile-repository'

export class PrismaUserProfileRepository implements UserProfileRepository {
  async getProfile(userId: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id: userId },
    })
  }

  async updateProfile(
    userId: string,
    data: UpdateUserProfileData,
  ): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data,
    })
  }
}
