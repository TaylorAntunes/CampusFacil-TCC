import { UserProfileRepository } from '../repositories/user-profile-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

interface UploadAvatarServiceRequest {
  userId: string
  avatar_url: string
}

export class UploadAvatarService {
  constructor(private userProfileRepository: UserProfileRepository) {}

  async execute({ userId, avatar_url }: UploadAvatarServiceRequest) {
    const user = await this.userProfileRepository.getProfile(userId)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    const updatedUser = await this.userProfileRepository.updateProfile(userId, {
      avatar_url,
    })

    return updatedUser
  }
}
