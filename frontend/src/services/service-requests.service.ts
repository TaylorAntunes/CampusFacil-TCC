import api from './api';

export type ServiceRequestStatus = 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';

export interface ServiceRequest {
  id: string;
  status: ServiceRequestStatus;
  advertisementId?: string;
  requesterId: string;
  message?: string;
  createdAt: string;
  updatedAt: string;
  advertisement?: {
    id: string;
    title: string;
    image?: string;
    price?: number;
    author?: {
      id: string;
      name?: string;
      avatar_url?: string;
    };
    category?: {
      id: string;
      name: string;
    };
  };
  requester?: {
    id: string;
    name?: string;
    avatar_url?: string;
  };
}

export interface CreateServiceRequestRequest {
  advertisementId?: string;
  message: string;
}

const normalizeServiceRequest = (request: any): ServiceRequest => ({
  ...request,
  createdAt: request.created_at,
  updatedAt: request.updated_at,
  advertisement: request.advertisement
    ? {
        ...request.advertisement,
        price: request.advertisement.price ? Number(request.advertisement.price) : undefined,
      }
    : undefined,
});

export const serviceRequestsService = {
  async create(data: CreateServiceRequestRequest): Promise<void> {
    await api.post('/service-requests', data);
  },

  async updateStatus(id: string, status: ServiceRequestStatus): Promise<{ serviceRequest: ServiceRequest }> {
    const response = await api.patch(`/service-requests/${id}/status`, { status });
    return {
      serviceRequest: normalizeServiceRequest(response.data.serviceRequest),
    };
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/service-requests/${id}`);
  },

  async getUserServiceRequests(): Promise<{ serviceRequests: ServiceRequest[] }> {
    const response = await api.get('/users/orders');
    const serviceRequests = (response.data.serviceRequests || []).map(normalizeServiceRequest);
    return { serviceRequests };
  },

  async getAdvertisementServiceRequests(advertisementId: string): Promise<{ serviceRequests: ServiceRequest[] }> {
    const response = await api.get(`/advertisements/${advertisementId}/service-requests`);
    const serviceRequests = (response.data.serviceRequests || []).map(normalizeServiceRequest);
    return { serviceRequests };
  },

  async getTransactionHistory(): Promise<{ serviceRequests: ServiceRequest[] }> {
    const response = await api.get('/users/history');
    const serviceRequests = (response.data.serviceRequests || []).map(normalizeServiceRequest);
    return { serviceRequests };
  },
};
