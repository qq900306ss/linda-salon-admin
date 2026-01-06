import api from '../api';

export interface Service {
  id: number;
  name: string;
  description: string;
  category: string;
  duration: number; // minutes
  price: number;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateServiceRequest {
  name: string;
  description: string;
  category: string;
  duration: number;
  price: number;
  image_url?: string;
  is_active?: boolean;
}

export interface UpdateServiceRequest extends Partial<CreateServiceRequest> {}

export const serviceService = {
  async getAll(): Promise<Service[]> {
    const response = await api.get('/api/v1/services');
    return response.data;
  },

  async getById(id: number): Promise<Service> {
    const response = await api.get(`/api/v1/services/${id}`);
    return response.data;
  },

  async create(data: CreateServiceRequest): Promise<Service> {
    const response = await api.post('/api/v1/admin/services', data);
    return response.data;
  },

  async update(id: number, data: UpdateServiceRequest): Promise<Service> {
    const response = await api.put(`/api/v1/admin/services/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/v1/admin/services/${id}`);
  },
};
