export interface DashboardStats {
  publishedAdvertisements: number
  activeServiceRequests: number
  unreadMessages: number
  rating: number
  monthlyEarnings: number
  monthlySpent: number
  contracts: number
}

export interface DashboardRepository {
  getStats(userId: string): Promise<DashboardStats>
}
