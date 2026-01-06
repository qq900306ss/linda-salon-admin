import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { bookingService, Booking } from '../lib/services/booking.service';
import Layout from '../components/Layout/Layout';

export default function BookingsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

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

  const handleStatusChange = async (id: number, newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled') => {
    if (!confirm(`確定要將預約狀態改為「${getStatusText(newStatus)}」嗎？`)) {
      return;
    }

    try {
      await bookingService.updateStatus(id, { status: newStatus });
      alert('狀態更新成功');
      fetchBookings();
    } catch (err: any) {
      alert(err.response?.data?.error || '狀態更新失敗');
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'confirmed': '已確認',
      'pending': '待確認',
      'completed': '已完成',
      'cancelled': '已取消',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'confirmed': 'bg-green-100 text-green-700 border-green-200',
      'pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'completed': 'bg-blue-100 text-blue-700 border-blue-200',
      'cancelled': 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const filteredBookings = filterStatus === 'all'
    ? bookings
    : bookings.filter(b => b.status === filterStatus);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout title="Bookings Management" subtitle="View and manage customer bookings">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Filter Bar */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterStatus === 'all'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            全部 ({bookings.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterStatus === 'pending'
                ? 'bg-yellow-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            待確認 ({bookings.filter(b => b.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilterStatus('confirmed')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterStatus === 'confirmed'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            已確認 ({bookings.filter(b => b.status === 'confirmed').length})
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterStatus === 'completed'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            已完成 ({bookings.filter(b => b.status === 'completed').length})
          </button>
          <button
            onClick={() => setFilterStatus('cancelled')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterStatus === 'cancelled'
                ? 'bg-gray-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            已取消 ({bookings.filter(b => b.status === 'cancelled').length})
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-md border border-gray-100">
          <div className="text-6xl mb-4">📅</div>
          <p className="text-gray-500 text-lg mb-6">
            {filterStatus === 'all' ? '目前沒有預約記錄' : '此狀態下沒有預約記錄'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">預約編號</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">客戶</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">服務</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">設計師</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">預約時間</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">狀態</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-mono text-sm text-gray-600">#{booking.id}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-900">{booking.user?.name || '沒有姓名'}</p>
                        <p className="text-sm text-gray-600">{booking.user?.phone || '沒有電話'}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        {booking.services && booking.services.length > 0 ? (
                          <>
                            {booking.services.map((service: any, idx: number) => (
                              <p key={idx} className="text-sm text-gray-900">
                                {service.name}
                                {idx < booking.services.length - 1 && ', '}
                              </p>
                            ))}
                            <p className="text-sm text-gray-600 mt-1">
                              共 {booking.duration || 0} 分鐘 · NT$ {booking.price || 0}
                            </p>
                          </>
                        ) : (
                          <p className="text-gray-500">沒有服務</p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-700">{booking.stylist?.name || '沒有設計師'}</td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-900">
                          {new Date(booking.booking_date).toLocaleDateString('zh-TW', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          })}
                        </p>
                        <p className="text-sm text-gray-600">{booking.start_time}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1.5 text-xs font-medium rounded-full border ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => handleStatusChange(booking.id, 'confirmed')}
                            className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors"
                          >
                            確認
                          </button>
                        )}
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => handleStatusChange(booking.id, 'completed')}
                            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                          >
                            完成
                          </button>
                        )}
                        {(booking.status === 'pending' || booking.status === 'confirmed') && (
                          <button
                            onClick={() => handleStatusChange(booking.id, 'cancelled')}
                            className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors"
                          >
                            取消
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
}
