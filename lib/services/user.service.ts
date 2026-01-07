import api from '../api';
import { Booking } from './booking.service';

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: 'customer' | 'admin';
  oauth_provider?: string;
  oauth_provider_id?: string;
  created_at: string;
  updated_at: string;
}

export interface UsersResponse {
  users: User[];
  total: number;
  limit: number;
  offset: number;
}

export const userService = {
  async getAll(limit = 100, offset = 0): Promise<UsersResponse> {
    const response = await api.get('/admin/users', {
      params: { limit, offset }
    });
    return response.data;
  },

  async getById(id: number): Promise<User> {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  async getUserBookings(id: number): Promise<Booking[]> {
    const response = await api.get(`/admin/users/${id}/bookings`);
    return response.data;
  }
};
