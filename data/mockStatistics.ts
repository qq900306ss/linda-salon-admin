// 模擬統計資料
export interface DashboardStats {
  todayBookings: number;
  weekBookings: number;
  monthBookings: number;
  monthRevenue: number;
  todayRevenue: number;
  weekRevenue: number;
  popularServices: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  topStylists: Array<{
    name: string;
    bookings: number;
    revenue: number;
  }>;
  revenueByDay: Array<{
    date: string;
    revenue: number;
    bookings: number;
  }>;
  bookingsByStatus: {
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
}

export const mockStatistics: DashboardStats = {
  todayBookings: 8,
  weekBookings: 45,
  monthBookings: 180,
  monthRevenue: 285000,
  todayRevenue: 12500,
  weekRevenue: 68000,
  popularServices: [
    { name: '剪髮', count: 65, percentage: 36 },
    { name: '染髮', count: 42, percentage: 23 },
    { name: '燙髮', count: 28, percentage: 16 },
    { name: '臉部護理', count: 22, percentage: 12 },
    { name: '護髮', count: 15, percentage: 8 },
    { name: '美睫', count: 8, percentage: 5 },
  ],
  topStylists: [
    { name: 'Amy 老師', bookings: 58, revenue: 92000 },
    { name: 'Cindy 老師', bookings: 52, revenue: 88000 },
    { name: 'Bella 老師', bookings: 38, revenue: 52000 },
    { name: 'Diana 老師', bookings: 32, revenue: 53000 },
  ],
  revenueByDay: [
    { date: '12/28', revenue: 8500, bookings: 6 },
    { date: '12/29', revenue: 12000, bookings: 8 },
    { date: '12/30', revenue: 9500, bookings: 7 },
    { date: '12/31', revenue: 11000, bookings: 9 },
    { date: '01/01', revenue: 6000, bookings: 4 },
    { date: '01/02', revenue: 13500, bookings: 10 },
    { date: '01/03', revenue: 10500, bookings: 8 },
  ],
  bookingsByStatus: {
    pending: 12,
    confirmed: 58,
    completed: 105,
    cancelled: 5,
  },
};
