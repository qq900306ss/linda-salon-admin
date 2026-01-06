import api from '../api';

export interface Stylist {
  id: number;
  name: string;
  description: string;
  specialty: string;
  experience?: number;
  avatar?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StylistSchedule {
  id: number;
  stylist_id: number;
  day_of_week: number; // 0-6 (Sunday-Saturday)
  start_time: string; // "09:00"
  end_time: string; // "18:00"
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateStylistRequest {
  name: string;
  description: string;
  specialty: string;
  experience?: number;
  avatar?: string;
  is_active?: boolean;
}

export interface UpdateStylistRequest extends Partial<CreateStylistRequest> {}

export interface CreateScheduleRequest {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export const stylistService = {
  async getAll(): Promise<Stylist[]> {
    const response = await api.get('/api/v1/stylists');
    return response.data;
  },

  async getById(id: number): Promise<Stylist> {
    const response = await api.get(`/api/v1/stylists/${id}`);
    return response.data;
  },

  async create(data: CreateStylistRequest): Promise<Stylist> {
    const response = await api.post('/api/v1/admin/stylists', data);
    return response.data;
  },

  async update(id: number, data: UpdateStylistRequest): Promise<Stylist> {
    const response = await api.put(`/api/v1/admin/stylists/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/v1/admin/stylists/${id}`);
  },

  async getSchedules(stylistId: number): Promise<StylistSchedule[]> {
    const response = await api.get(`/api/v1/stylists/${stylistId}/schedules`);
    return response.data;
  },

  async createSchedule(stylistId: number, data: CreateScheduleRequest): Promise<StylistSchedule> {
    const response = await api.post(`/api/v1/admin/stylists/${stylistId}/schedules`, data);
    return response.data;
  },

  async deleteSchedule(scheduleId: number): Promise<void> {
    await api.delete(`/api/v1/admin/stylists/schedules/${scheduleId}`);
  },
};
