import api from './api';
import { normalizeAdvertisement, Advertisement } from './advertisements.service';

export interface SellerProfile {
  id: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  email?: string;
  location?: string;
  response_time?: string;
  skills?: string[];
  created_at?: string;
}

export interface SellerProfileResponse {
  seller: SellerProfile;
  advertisements: Advertisement[];
}

export const sellersService = {
  async getById(sellerId: string): Promise<SellerProfileResponse> {
    const response = await api.get(`/sellers/${sellerId}`);
    const seller: SellerProfile = response.data.seller;
    const advertisements = (response.data.advertisements ?? []).map(normalizeAdvertisement);
    return { seller, advertisements };
  },
};
