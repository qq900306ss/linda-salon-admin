import api from '../api';

export interface DashboardStats {
  today_bookings: number;
  week_bookings: number;
  month_bookings: number;
  today_revenue: number;
  month_revenue: number;
  revenue_by_day: Array<{
    date: string;
    revenue: number;
    bookings: number;
  }> | null;
  popular_services: Array<{
    service_id: number;
    name: string;
    count: number;
  }> | null;
  top_stylists: Array<{
    id: number;
    name: string;
    booking_count: number;
    revenue: number | null;
  }>;
}

export interface RevenueReport {
  date: string;
  revenue: number;
  bookings_count: number;
}

export const statisticsService = {
  async getDashboard(): Promise<DashboardStats> {
    const response = await api.get('/api/v1/admin/statistics/dashboard');
    return response.data;
  },

  async getRevenue(params?: { start_date?: string; end_date?: string }): Promise<RevenueReport[]> {
    const response = await api.get('/api/v1/admin/statistics/revenue', { params });
    return response.data;
  },
};
