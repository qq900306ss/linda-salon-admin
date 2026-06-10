// ===== 後端資料模型（欄位名稱與後端 JSON 完全一致） =====

export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  durationMinutes: number;
  price: number;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
}

export interface StylistSchedule {
  workDays: number[];
  startTime: string;
  endTime: string;
  daysOff: string[];
}

export interface Stylist {
  id: string;
  name: string;
  title: string;
  bio: string;
  specialties: string[];
  imageUrl: string;
  yearsExperience: number;
  rating: number;
  isActive: boolean;
  schedule: StylistSchedule;
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface BookingCustomer {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

export interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  stylistId: string;
  stylistName: string;
  date: string;
  time: string;
  durationMinutes: number;
  price: number;
  status: BookingStatus;
  customer: BookingCustomer;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  salonName: string;
  phone: string;
  address: string;
  openTime: string;
  closeTime: string;
  slotIntervalMinutes: number;
  closedWeekdays: number[];
}

export interface PeriodStats {
  bookings: number;
  revenue: number;
}

export interface PopularService {
  serviceId: string;
  serviceName: string;
  count: number;
  revenue: number;
}

export interface TopStylist {
  stylistId: string;
  stylistName: string;
  count: number;
  revenue: number;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  bookings: number;
}

export interface DashboardStats {
  today: PeriodStats;
  week: PeriodStats;
  month: PeriodStats;
  pendingCount: number;
  popularServices: PopularService[];
  topStylists: TopStylist[];
  recentBookings: Booking[];
  dailyRevenue: DailyRevenue[];
}

export interface Customer {
  phone: string;
  name: string;
  email: string;
  totalBookings: number;
  totalSpent: number;
  lastVisit: string;
  firstVisit: string;
}

export interface LoginResponse {
  token: string;
  expiresIn: number;
  user: {
    username: string;
    [key: string]: unknown;
  };
}

export interface UploadResponse {
  uploadUrl: string;
  publicUrl: string;
}
