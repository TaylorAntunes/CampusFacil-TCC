import { DashboardRepository } from '../repositories/dashboard-repository'

interface GetDashboardStatsServiceRequest {
  userId: string
}

export class GetDashboardStatsService {
  constructor(private dashboardRepository: DashboardRepository) {}

  async execute({ userId }: GetDashboardStatsServiceRequest) {
    const stats = await this.dashboardRepository.getStats(userId)

    return stats
  }
}
