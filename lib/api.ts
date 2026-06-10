import type {
  Booking,
  BookingStatus,
  Customer,
  DailyRevenue,
  DashboardStats,
  LoginResponse,
  Service,
  Settings,
  Stylist,
  StylistSchedule,
  UploadResponse,
} from './types';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const TOKEN_KEY = 'linda_admin_token';

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

interface Envelope<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new ApiError('NETWORK_ERROR', '無法連線至伺服器，請檢查網路連線', 0);
  }

  if (res.status === 401 && typeof window !== 'undefined') {
    clearToken();
    if (!window.location.pathname.startsWith('/login')) {
      window.location.href = '/login/';
    }
    throw new ApiError('UNAUTHORIZED', '登入已過期，請重新登入', 401);
  }

  let body: Envelope<T>;
  try {
    body = await res.json();
  } catch {
    throw new ApiError('PARSE_ERROR', '伺服器回應格式錯誤', res.status);
  }

  if (!res.ok || !body.success) {
    const code = body.error?.code || `HTTP_${res.status}`;
    const message = body.error?.message || '發生未知錯誤';
    throw new ApiError(code, message, res.status);
  }

  return body.data as T;
}

function qs(params: Record<string, string | undefined>): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== ''
  ) as [string, string][];
  if (entries.length === 0) return '';
  return '?' + new URLSearchParams(entries).toString();
}

// ===== Auth =====

export function login(username: string, password: string) {
  return request<LoginResponse>('/api/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

// ===== Bookings =====

export function getBookings(filters?: {
  date?: string;
  from?: string;
  to?: string;
  status?: string;
  stylistId?: string;
}) {
  return request<Booking[]>(`/api/admin/bookings${qs(filters || {})}`);
}

export function updateBookingStatus(id: string, status: BookingStatus) {
  return request<Booking>(`/api/admin/bookings/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function deleteBooking(id: string) {
  return request<void>(`/api/admin/bookings/${id}`, { method: 'DELETE' });
}

// ===== Services =====

export function getServices() {
  return request<Service[]>('/api/admin/services');
}

export function createService(payload: Omit<Service, 'id'>) {
  return request<Service>('/api/admin/services', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateService(id: string, payload: Partial<Omit<Service, 'id'>>) {
  return request<Service>(`/api/admin/services/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteService(id: string) {
  return request<void>(`/api/admin/services/${id}`, { method: 'DELETE' });
}

// ===== Stylists =====

export function getStylists() {
  return request<Stylist[]>('/api/admin/stylists');
}

export function createStylist(payload: Omit<Stylist, 'id'>) {
  return request<Stylist>('/api/admin/stylists', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateStylist(id: string, payload: Partial<Omit<Stylist, 'id'>>) {
  return request<Stylist>(`/api/admin/stylists/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteStylist(id: string) {
  return request<void>(`/api/admin/stylists/${id}`, { method: 'DELETE' });
}

export function getStylistSchedule(id: string) {
  return request<StylistSchedule>(`/api/admin/stylists/${id}/schedule`);
}

export function updateStylistSchedule(id: string, schedule: StylistSchedule) {
  return request<StylistSchedule>(`/api/admin/stylists/${id}/schedule`, {
    method: 'PUT',
    body: JSON.stringify(schedule),
  });
}

// ===== Customers =====

export function getCustomers() {
  return request<Customer[]>('/api/admin/customers');
}

// ===== Statistics =====

export function getDashboardStats() {
  return request<DashboardStats>('/api/admin/statistics/dashboard');
}

export function getRevenueStats(from: string, to: string) {
  return request<DailyRevenue[]>(
    `/api/admin/statistics/revenue${qs({ from, to })}`
  );
}

// ===== Settings =====

export function getSettings() {
  return request<Settings>('/api/admin/settings');
}

export function updateSettings(payload: Settings) {
  return request<Settings>('/api/admin/settings', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

// ===== Uploads =====

export function createUpload(fileName: string, contentType: string) {
  return request<UploadResponse>('/api/admin/uploads', {
    method: 'POST',
    body: JSON.stringify({ fileName, contentType }),
  });
}

/** 取得預簽名網址並直接上傳檔案，回傳公開網址 */
export async function uploadImage(file: File): Promise<string> {
  const { uploadUrl, publicUrl } = await createUpload(file.name, file.type);
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });
  if (!res.ok) {
    throw new ApiError('UPLOAD_FAILED', '圖片上傳失敗，請稍後再試', res.status);
  }
  return publicUrl;
}
