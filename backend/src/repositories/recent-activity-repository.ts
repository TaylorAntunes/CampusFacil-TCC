export interface RecentActivity {
  id: string
  type:
    | 'ADVERTISEMENT_CREATED'
    | 'SERVICE_REQUEST_CREATED'
    | 'SERVICE_REQUEST_UPDATED'
    | 'REVIEW_CREATED'
    | 'MESSAGE_SENT'
  description: string
  timestamp: Date
  metadata?: Record<string, any>
}

export interface RecentActivityRepository {
  getRecentActivity(userId: string, limit?: number): Promise<RecentActivity[]>
}
