import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout/Layout';
import { Calendar as BigCalendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';
import { bookingService, Booking } from '../lib/services/booking.service';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// 設定行事曆本地化
const locales = {
  'zh-TW': zhTW,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: zhTW }),
  getDay,
  locales,
});

// 行事曆事件型別
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    booking: Booking;
    status: string;
  };
}

export default function CalendarPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // 驗證管理員權限並載入資料
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      if (user?.role !== 'admin') {
        alert('需要管理員權限');
        router.push('/login');
        return;
      }
      fetchBookings();
    }
  }, [authLoading, isAuthenticated, user, router]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const data = await bookingService.getAll();
      setBookings(data);
      setError('');
    } catch (err: any) {
      console.error('Failed to fetch bookings:', err);
      setError(err.response?.data?.error || '載入預約資料失敗');
    } finally {
      setIsLoading(false);
    }
  };

  // 將預約資料轉換為行事曆事件
  const events: CalendarEvent[] = useMemo(() => {
    return bookings.map((booking) => {
      const [hours, minutes] = booking.start_time.split(':');
      const startDate = new Date(booking.booking_date);
      startDate.setHours(parseInt(hours), parseInt(minutes));

      const [endHours, endMinutes] = booking.end_time.split(':');
      const endDate = new Date(booking.booking_date);
      endDate.setHours(parseInt(endHours), parseInt(endMinutes));

      const serviceNames = booking.services && booking.services.length > 0
        ? booking.services.map((s: any) => s.name).join(', ')
        : '未知服務';
      const customerName = booking.user?.name || '未知客戶';

      return {
        id: booking.id.toString(),
        title: `${customerName} - ${serviceNames}`,
        start: startDate,
        end: endDate,
        resource: {
          booking,
          status: booking.status,
        },
      };
    });
  }, [bookings]);

  // 事件樣式
  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#f0653a'; // primary
    switch (event.resource.status) {
      case 'pending':
        backgroundColor = '#eab308'; // yellow
        break;
      case 'confirmed':
        backgroundColor = '#10b981'; // green
        break;
      case 'completed':
        backgroundColor = '#6b7280'; // gray
        break;
      case 'cancelled':
        backgroundColor = '#ef4444'; // red
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block',
      },
    };
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  const handleStatusChange = async (id: number, newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled') => {
    const statusText = {
      pending: '待確認',
      confirmed: '已確認',
      completed: '已完成',
      cancelled: '已取消',
    };

    if (!confirm(`確定要將預約狀態改為「${statusText[newStatus]}」嗎？`)) {
      return;
    }

    try {
      await bookingService.updateStatus(id, { status: newStatus });
      await fetchBookings(); // 重新載入資料
      setSelectedEvent(null); // 關閉彈窗
      alert('狀態更新成功');
    } catch (err: any) {
      console.error('Failed to update status:', err);
      alert(err.response?.data?.error || '更新狀態失敗');
    }
  };

  // 統計當天預約
  const todayBookingsCount = events.filter((event) => {
    const today = new Date();
    return event.start.toDateString() === today.toDateString();
  }).length;

  // Loading 狀態
  if (authLoading || isLoading) {
    return (
      <Layout title="行事曆" subtitle="查看所有預約排程">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">載入中...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Error 狀態
  if (error) {
    return (
      <Layout title="行事曆" subtitle="查看所有預約排程">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={fetchBookings} className="btn-primary">
            重試
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="行事曆" subtitle="查看所有預約排程">
      {/* Filter Bar */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm text-gray-600">總預約數</p>
              <p className="text-2xl font-bold text-gray-900">{events.length}</p>
            </div>
            <div className="h-10 w-px bg-gray-300" />
            <div>
              <p className="text-sm text-gray-600">今日預約</p>
              <p className="text-2xl font-bold text-primary-600">{todayBookingsCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-yellow-500 rounded" />
                待確認
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-green-500 rounded" />
                已確認
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-gray-500 rounded" />
                已完成
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-red-500 rounded" />
                已取消
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="card" style={{ height: '700px' }}>
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleSelectEvent}
          culture="zh-TW"
          messages={{
            next: '下一頁',
            previous: '上一頁',
            today: '今天',
            month: '月',
            week: '週',
            day: '日',
            agenda: '議程',
            date: '日期',
            time: '時間',
            event: '事件',
            noEventsInRange: '此範圍內沒有預約',
            showMore: (total) => `+${total} 更多`,
          }}
        />
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">預約詳情</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">客戶姓名</p>
                <p className="text-lg font-medium text-gray-900">
                  {selectedEvent.resource.booking.user?.name || '未知客戶'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">聯絡電話</p>
                <p className="text-gray-900">
                  {selectedEvent.resource.booking.user?.phone || '未提供'}
                </p>
              </div>

              {selectedEvent.resource.booking.user?.email && (
                <div>
                  <p className="text-sm text-gray-600">電子郵件</p>
                  <p className="text-gray-900">{selectedEvent.resource.booking.user.email}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600 mb-2">服務項目</p>
                {selectedEvent.resource.booking.services && selectedEvent.resource.booking.services.length > 0 ? (
                  <div className="space-y-1">
                    {selectedEvent.resource.booking.services.map((service: any, idx: number) => (
                      <p key={idx} className="text-gray-900">
                        • {service.name} ({service.duration} 分鐘 / NT$ {service.price})
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">沒有服務</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">設計師</p>
                  <p className="text-gray-900">
                    {selectedEvent.resource.booking.stylist?.name || '未指定'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">預約時間</p>
                  <p className="text-gray-900">
                    {format(selectedEvent.start, 'yyyy/MM/dd HH:mm')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">總時長</p>
                  <p className="text-gray-900">
                    {selectedEvent.resource.booking.duration || 0} 分鐘
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">總金額</p>
                  <p className="text-xl font-bold text-primary-600">
                    NT$ {(selectedEvent.resource.booking.price || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">狀態</p>
                <span
                  className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                    selectedEvent.resource.status === 'confirmed'
                      ? 'bg-green-100 text-green-700'
                      : selectedEvent.resource.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : selectedEvent.resource.status === 'completed'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {selectedEvent.resource.status === 'confirmed'
                    ? '已確認'
                    : selectedEvent.resource.status === 'pending'
                    ? '待確認'
                    : selectedEvent.resource.status === 'completed'
                    ? '已完成'
                    : '已取消'}
                </span>
              </div>

              {selectedEvent.resource.booking.notes && (
                <div>
                  <p className="text-sm text-gray-600">備註</p>
                  <p className="text-gray-900">{selectedEvent.resource.booking.notes}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              {selectedEvent.resource.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleStatusChange(selectedEvent.resource.booking.id, 'confirmed')}
                    className="btn-primary flex-1"
                  >
                    確認預約
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedEvent.resource.booking.id, 'cancelled')}
                    className="btn-secondary flex-1"
                  >
                    取消預約
                  </button>
                </>
              )}
              {selectedEvent.resource.status === 'confirmed' && (
                <>
                  <button
                    onClick={() => handleStatusChange(selectedEvent.resource.booking.id, 'completed')}
                    className="btn-primary flex-1"
                  >
                    標記完成
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedEvent.resource.booking.id, 'cancelled')}
                    className="btn-secondary flex-1"
                  >
                    取消預約
                  </button>
                </>
              )}
              {selectedEvent.resource.status === 'completed' && (
                <button onClick={handleCloseModal} className="btn-secondary flex-1">
                  關閉
                </button>
              )}
              {selectedEvent.resource.status === 'cancelled' && (
                <button onClick={handleCloseModal} className="btn-secondary flex-1">
                  關閉
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
