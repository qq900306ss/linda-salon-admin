import api from '../api';

export interface BookingServiceItem {
  id: number;
  name: string;
  price: number;
  duration: number;
}

export interface Booking {
  id: number;
  user_id: number;
  stylist_id: number;
  booking_date: string; // ISO date string
  start_time: string;
  end_time: string;
  duration: number;
  price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
  // Populated fields
  user?: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  services: BookingServiceItem[]; // 改為 JSONB 陣列
  stylist?: {
    id: number;
    name: string;
  };
}

export interface CreateBookingRequest {
  service_id: number;
  stylist_id: number;
  booking_date: string;
  start_time: string;
  notes?: string;
}

export interface UpdateBookingStatusRequest {
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export const bookingService = {
  async getAll(): Promise<Booking[]> {
    const response = await api.get('/api/v1/bookings');
    return response.data.bookings || [];
  },

  async getById(id: number): Promise<Booking> {
    const response = await api.get(`/api/v1/bookings/${id}`);
    return response.data;
  },

  async create(data: CreateBookingRequest): Promise<Booking> {
    const response = await api.post('/api/v1/bookings', data);
    return response.data;
  },

  async cancel(id: number): Promise<void> {
    await api.post(`/api/v1/bookings/${id}/cancel`);
  },

  // Admin endpoints
  async updateStatus(id: number, data: UpdateBookingStatusRequest): Promise<Booking> {
    const response = await api.patch(`/api/v1/admin/bookings/${id}/status`, data);
    return response.data;
  },
};
