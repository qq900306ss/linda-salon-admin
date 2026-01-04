// 模擬預約資料
export interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceName: string;
  serviceId: string;
  stylistName: string;
  stylistId: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export const mockBookings: Booking[] = [
  {
    id: '1',
    customerName: '王小姐',
    customerPhone: '0912-345-678',
    customerEmail: 'wang@email.com',
    serviceName: '剪髮',
    serviceId: '1',
    stylistName: 'Amy 老師',
    stylistId: '1',
    date: '2026-01-04',
    time: '10:00',
    duration: 60,
    price: 800,
    status: 'confirmed',
    createdAt: '2026-01-02T10:00:00Z',
  },
  {
    id: '2',
    customerName: '李先生',
    customerPhone: '0923-456-789',
    serviceName: '染髮',
    serviceId: '2',
    stylistName: 'Cindy 老師',
    stylistId: '3',
    date: '2026-01-04',
    time: '14:00',
    duration: 120,
    price: 2500,
    status: 'confirmed',
    createdAt: '2026-01-03T09:00:00Z',
  },
  {
    id: '3',
    customerName: '張小姐',
    customerPhone: '0934-567-890',
    customerEmail: 'chang@email.com',
    serviceName: '美甲',
    serviceId: '6',
    stylistName: 'Bella 老師',
    stylistId: '2',
    date: '2026-01-04',
    time: '16:00',
    duration: 60,
    price: 1000,
    status: 'pending',
    notes: '第一次來店',
    createdAt: '2026-01-04T08:00:00Z',
  },
  {
    id: '4',
    customerName: '陳太太',
    customerPhone: '0945-678-901',
    serviceName: '燙髮',
    serviceId: '3',
    stylistName: 'Amy 老師',
    stylistId: '1',
    date: '2026-01-05',
    time: '10:00',
    duration: 150,
    price: 3000,
    status: 'confirmed',
    createdAt: '2026-01-03T14:00:00Z',
  },
  {
    id: '5',
    customerName: '林小姐',
    customerPhone: '0956-789-012',
    serviceName: '臉部護理',
    serviceId: '5',
    stylistName: 'Diana 老師',
    stylistId: '4',
    date: '2026-01-05',
    time: '13:30',
    duration: 90,
    price: 1800,
    status: 'confirmed',
    createdAt: '2026-01-04T10:00:00Z',
  },
  {
    id: '6',
    customerName: '黃先生',
    customerPhone: '0967-890-123',
    serviceName: '剪髮',
    serviceId: '1',
    stylistName: 'Cindy 老師',
    stylistId: '3',
    date: '2026-01-05',
    time: '15:00',
    duration: 60,
    price: 800,
    status: 'pending',
    createdAt: '2026-01-04T11:00:00Z',
  },
  {
    id: '7',
    customerName: '吳小姐',
    customerPhone: '0978-901-234',
    customerEmail: 'wu@email.com',
    serviceName: '美睫',
    serviceId: '7',
    stylistName: 'Bella 老師',
    stylistId: '2',
    date: '2026-01-06',
    time: '11:00',
    duration: 90,
    price: 1500,
    status: 'confirmed',
    notes: '對蛋白質過敏',
    createdAt: '2026-01-03T16:00:00Z',
  },
  {
    id: '8',
    customerName: '劉太太',
    customerPhone: '0989-012-345',
    serviceName: '護髮',
    serviceId: '4',
    stylistName: 'Amy 老師',
    stylistId: '1',
    date: '2026-01-06',
    time: '14:00',
    duration: 45,
    price: 1200,
    status: 'confirmed',
    createdAt: '2026-01-04T09:30:00Z',
  },
];

// 生成更多假資料用於統計
export function generateMockBookings(count: number = 50): Booking[] {
  const services = [
    { id: '1', name: '剪髮', duration: 60, price: 800 },
    { id: '2', name: '染髮', duration: 120, price: 2500 },
    { id: '3', name: '燙髮', duration: 150, price: 3000 },
    { id: '4', name: '護髮', duration: 45, price: 1200 },
    { id: '5', name: '臉部護理', duration: 90, price: 1800 },
    { id: '6', name: '美甲', duration: 60, price: 1000 },
    { id: '7', name: '美睫', duration: 90, price: 1500 },
  ];

  const stylists = [
    { id: '1', name: 'Amy 老師' },
    { id: '2', name: 'Bella 老師' },
    { id: '3', name: 'Cindy 老師' },
    { id: '4', name: 'Diana 老師' },
  ];

  const statuses: Array<'pending' | 'confirmed' | 'completed' | 'cancelled'> = [
    'confirmed',
    'confirmed',
    'confirmed',
    'completed',
    'pending',
  ];

  const bookings: Booking[] = [];

  for (let i = 0; i < count; i++) {
    const service = services[Math.floor(Math.random() * services.length)];
    const stylist = stylists[Math.floor(Math.random() * stylists.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    // 生成過去30天的隨機日期
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    bookings.push({
      id: `booking-${i + 100}`,
      customerName: `客戶${i + 1}`,
      customerPhone: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
      serviceName: service.name,
      serviceId: service.id,
      stylistName: stylist.name,
      stylistId: stylist.id,
      date: date.toISOString().split('T')[0],
      time: `${Math.floor(10 + Math.random() * 9)}:${['00', '30'][Math.floor(Math.random() * 2)]}`,
      duration: service.duration,
      price: service.price,
      status,
      createdAt: new Date(date.getTime() - 86400000).toISOString(),
    });
  }

  return bookings;
}
