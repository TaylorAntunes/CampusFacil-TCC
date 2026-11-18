import { UserProfileRepository } from '../repositories/user-profile-repository'

interface GetUserProfileServiceRequest {
  userId: string
}

export class GetUserProfileService {
  constructor(private userProfileRepository: UserProfileRepository) {}

  async execute({ userId }: GetUserProfileServiceRequest) {
    const userProfile = await this.userProfileRepository.getProfile(userId)

    return userProfile
  }
}
