import { useState, useMemo } from 'react';
import Layout from '../components/Layout/Layout';
import { Calendar as BigCalendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { mockBookings, generateMockBookings } from '../data/mockBookings';

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
    booking: any;
    status: string;
  };
}

export default function CalendarPage() {
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // 合併所有預約資料
  const allBookings = useMemo(() => {
    return [...mockBookings, ...generateMockBookings(30)];
  }, []);

  // 將預約資料轉換為行事曆事件
  const events: CalendarEvent[] = useMemo(() => {
    return allBookings.map((booking) => {
      const [hours, minutes] = booking.time.split(':');
      const startDate = new Date(booking.date);
      startDate.setHours(parseInt(hours), parseInt(minutes));

      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + booking.duration);

      return {
        id: booking.id,
        title: `${booking.customerName} - ${booking.serviceName}`,
        start: startDate,
        end: endDate,
        resource: {
          booking,
          status: booking.status,
        },
      };
    });
  }, [allBookings]);

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

  // 統計當天預約
  const todayBookingsCount = events.filter((event) => {
    const today = new Date();
    return event.start.toDateString() === today.toDateString();
  }).length;

  return (
    <Layout title="行事曆" subtitle="查看所有預約排程">
      {/* Filter Bar */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm text-gray-600">本月預約</p>
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
                  {selectedEvent.resource.booking.customerName}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">聯絡電話</p>
                <p className="text-gray-900">{selectedEvent.resource.booking.customerPhone}</p>
              </div>

              {selectedEvent.resource.booking.customerEmail && (
                <div>
                  <p className="text-sm text-gray-600">電子郵件</p>
                  <p className="text-gray-900">{selectedEvent.resource.booking.customerEmail}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">服務項目</p>
                  <p className="text-gray-900">{selectedEvent.resource.booking.serviceName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">設計師</p>
                  <p className="text-gray-900">{selectedEvent.resource.booking.stylistName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">預約時間</p>
                  <p className="text-gray-900">
                    {format(selectedEvent.start, 'yyyy/MM/dd HH:mm')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">服務時長</p>
                  <p className="text-gray-900">{selectedEvent.resource.booking.duration} 分鐘</p>
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

              <div>
                <p className="text-sm text-gray-600">金額</p>
                <p className="text-xl font-bold text-primary-600">
                  NT$ {selectedEvent.resource.booking.price.toLocaleString()}
                </p>
              </div>

              {selectedEvent.resource.booking.notes && (
                <div>
                  <p className="text-sm text-gray-600">備註</p>
                  <p className="text-gray-900">{selectedEvent.resource.booking.notes}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button className="btn-secondary flex-1">編輯預約</button>
              <button className="btn-primary flex-1">確認預約</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
