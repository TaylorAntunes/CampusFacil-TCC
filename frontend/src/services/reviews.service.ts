import api from './api';

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  advertisementId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  rating: number;
  comment?: string;
  advertisementId: string;
}

const normalizeReview = (review: any): Review => ({
  ...review,
  createdAt: review.created_at,
  updatedAt: review.updated_at,
});

export const reviewsService = {
  async getByAdvertisement(advertisementId: string): Promise<{ reviews: Review[] }> {
    const response = await api.get(`/advertisements/${advertisementId}/reviews`);
    const reviews = (response.data.reviews || []).map(normalizeReview);
    return { reviews };
  },

  async getUserReviews(): Promise<{ reviews: Review[] }> {
    const response = await api.get('/reviews');
    const reviews = (response.data.reviews || []).map(normalizeReview);
    return { reviews };
  },

  async create(data: CreateReviewRequest): Promise<void> {
    await api.post('/reviews', data);
  },
};
