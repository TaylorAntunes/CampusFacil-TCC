import api from './api';

export interface DashboardStats {
  publishedAdvertisements: number;
  activeServiceRequests: number;
  unreadMessages: number;
  rating: number;
  monthlyEarnings: number;
  monthlySpent: number;
  contracts: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

const normalizeStats = (stats: any): DashboardStats => ({
  publishedAdvertisements: Number(stats.publishedAdvertisements ?? 0),
  activeServiceRequests: Number(stats.activeServiceRequests ?? 0),
  unreadMessages: Number(stats.unreadMessages ?? 0),
  rating: Number(stats.rating ?? 0),
  monthlyEarnings: Number(stats.monthlyEarnings ?? 0),
  monthlySpent: Number(stats.monthlySpent ?? 0),
  contracts: Number(stats.contracts ?? 0),
});

const normalizeActivity = (item: any): RecentActivity => ({
  ...item,
  timestamp: item.timestamp ?? item.createdAt ?? item.updatedAt ?? new Date().toISOString(),
});

export const dashboardService = {
  async getStats(): Promise<{ stats: DashboardStats }> {
    const response = await api.get('/dashboard/stats');
    return {
      stats: normalizeStats(response.data ?? response),
    };
  },

  async getRecentActivity(): Promise<{ activity: RecentActivity[] }> {
    const response = await api.get('/dashboard/recent-activity');
    const activity = (response.data.activity || response.data || []).map(normalizeActivity);
    return { activity };
  },
};
