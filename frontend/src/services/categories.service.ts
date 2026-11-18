import api from './api';

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

export const categoriesService = {
  async getAll(): Promise<Category[]> {
    const response = await api.get('/categories');
    const payload = response.data;
    if (Array.isArray(payload)) {
      return payload;
    }
    if (Array.isArray(payload?.categories)) {
      return payload.categories;
    }
    if (Array.isArray(payload?.data?.categories)) {
      return payload.data.categories;
    }
    return [];
  },
};
