import api, { resolveApiAssetUrl } from './api';

export type AdvertisementAvailability = 'ACTIVE' | 'PAUSED';

export interface Advertisement {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  price: number;
  image?: string;
  authorId: string;
  author?: {
    id: string;
    name: string;
    avatar_url?: string;
    bio?: string;
    email?: string;
    created_at?: string;
  };
  availability: AdvertisementAvailability;
  createdAt: string;
  updatedAt: string;
  reviews?: {
    id?: string;
    rating: number;
    comment?: string;
    created_at?: string;
    reviewer?: {
      id: string;
      name: string;
      avatar_url?: string;
    };
  }[];
  deliveryTime?: string;
  features?: string[];
  rating?: number;
  reviewCount?: number;
}

export interface CreateAdvertisementRequest {
  title: string;
  description: string;
  categoryId: string;
  price: number;
  availability?: AdvertisementAvailability;
  image?: File | string;
}

export const normalizeAdvertisement = (advertisement: any): Advertisement => ({
  ...advertisement,
  price: typeof advertisement.price === 'string' ? Number(advertisement.price) : advertisement.price,
  image: resolveApiAssetUrl(advertisement.image),
  createdAt: advertisement.created_at,
  updatedAt: advertisement.updated_at,
});

export const advertisementsService = {
  async getAll(params?: Record<string, any>): Promise<{ advertisements: Advertisement[] }> {
    const response = await api.get('/advertisements', { params });
    const advertisements = response.data.advertisements ?? [];
    return { advertisements: advertisements.map(normalizeAdvertisement) };
  },

  async getById(id: string): Promise<{ advertisement: Advertisement }> {
    const response = await api.get(`/advertisements/${id}`);
    const advertisement = normalizeAdvertisement(response.data.advertisement);
    return { advertisement };
  },

  async create(data: CreateAdvertisementRequest): Promise<void> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('categoryId', data.categoryId);
    formData.append('price', String(data.price));
    formData.append('availability', data.availability ?? 'ACTIVE');
    if (data.image) {
      if (data.image instanceof File) {
        formData.append('image', data.image);
      } else {
        formData.append('image', data.image);
      }
    }

    const response = await api.post('/advertisements', formData);
    return response.data;
  },

  async update(id: string, data: Partial<CreateAdvertisementRequest>): Promise<{ advertisement: Advertisement }> {
    const formFields: Record<string, string> = {};
    let formData: FormData | null = null;
    const ensureFormData = () => {
      if (!formData) {
        formData = new FormData();
      }
      return formData;
    };

    if (data.title) {
      formFields.title = data.title;
    }
    if (data.description) {
      formFields.description = data.description;
    }
    if (data.categoryId) {
      formFields.categoryId = data.categoryId;
    }
    if (data.price !== undefined) {
      formFields.price = String(data.price);
    }

    if (data.image !== undefined) {
      if (data.image instanceof File) {
        const fd = ensureFormData();
        fd.append('image', data.image);
      } else if (data.image) {
        formFields.image = data.image;
      }
    }

    if (formData) {
      Object.entries(formFields).forEach(([key, value]) => {
        formData!.append(key, value);
      });
      const response = await api.put(`/advertisements/${id}`, formData);
      return response.data;
    }

    const payload: any = {};
    if (formFields.title) payload.title = formFields.title;
    if (formFields.description) payload.description = formFields.description;
    if (formFields.categoryId) payload.category = formFields.categoryId;
    if (formFields.price) payload.price = Number(formFields.price);
    if (formFields.image) payload.image = formFields.image;

    const response = await api.put(`/advertisements/${id}`, payload);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/advertisements/${id}`);
  },

  async getUserAdvertisements(): Promise<{ advertisements: Advertisement[] }> {
    const response = await api.get('/advertisements/user');
    const advertisements = response.data.advertisements ?? [];
    return { advertisements: advertisements.map(normalizeAdvertisement) };
  },

  async toggleAvailability(id: string): Promise<{ advertisement: Advertisement }> {
    const response = await api.patch(`/advertisements/${id}/toggle-availability`);
    return response.data;
  },

  async requestService(advertisementId: string, message: string): Promise<void> {
    await api.post(`/advertisements/${advertisementId}/requests`, { message });
  },

  async getAdvertisementServiceRequests(advertisementId: string): Promise<{ serviceRequests: any[] }> {
    const response = await api.get(`/advertisements/${advertisementId}/service-requests`);
    return response.data;
  },
};
