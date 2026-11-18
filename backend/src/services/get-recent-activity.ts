import { RecentActivityRepository } from '../repositories/recent-activity-repository'

interface GetRecentActivityServiceRequest {
  userId: string
}

export class GetRecentActivityService {
  constructor(private recentActivityRepository: RecentActivityRepository) {}

  async execute({ userId }: GetRecentActivityServiceRequest) {
    const activity =
      await this.recentActivityRepository.getRecentActivity(userId)

    return activity
  }
}
