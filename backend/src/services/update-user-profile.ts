import { userNameSchema } from '@/utils/user-name-schema'
import {
  UserProfileRepository,
  UpdateUserProfileData,
} from '../repositories/user-profile-repository'

interface UpdateUserProfileServiceRequest {
  userId: string
  data: UpdateUserProfileData
}

export class UpdateUserProfileService {
  constructor(private userProfileRepository: UserProfileRepository) {}

  async execute({ userId, data }: UpdateUserProfileServiceRequest) {
    if (data.name !== undefined) data = { ...data, name: userNameSchema.parse(data.name) }
    const userProfile = await this.userProfileRepository.updateProfile(
      userId,
      data,
    )

    return userProfile
  }
}
