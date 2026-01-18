import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { statisticsService, DashboardStats } from '../lib/services/statistics.service';
import { bookingService, Booking } from '../lib/services/booking.service';
import Layout from '../components/Layout/Layout';

export default function Dashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check authentication
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

      // Fetch data if authenticated
      fetchData();
    }
  }, [authLoading, isAuthenticated, user, router]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [dashboardData, bookingsData] = await Promise.all([
        statisticsService.getDashboard(),
        bookingService.getAll(),
      ]);

      setStats(dashboardData);
      setRecentBookings(bookingsData.slice(0, 5));
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

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

  if (error) {
    return (
      <Layout title="儀表板" subtitle="歡迎回來">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-bold text-red-800 mb-2">載入失敗</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            重試
          </button>
        </div>
      </Layout>
    );
  }

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
      'confirmed': 'bg-green-100 text-green-700',
      'pending': 'bg-yellow-100 text-yellow-700',
      'completed': 'bg-blue-100 text-blue-700',
      'cancelled': 'bg-gray-100 text-gray-700',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-700';
  };

  if (!stats) {
    return (
      <Layout title="Dashboard" subtitle="Welcome">
        <div className="text-center py-12">
          <p className="text-gray-600">No data available</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard" subtitle={`Welcome, ${user?.name}`}>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat-card group bg-white border-l-4 border-blue-500 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-500 text-sm font-medium tracking-wide">今日預約</p>
              <p className="text-3xl font-bold mt-2 text-secondary-800">{stats.today_bookings}</p>
            </div>
            <div className="bg-blue-50 text-blue-500 rounded-full p-3 shadow-sm border border-blue-100 group-hover:bg-blue-100 transition-colors">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </div>

        <div className="stat-card group bg-white border-l-4 border-purple-500 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-500 text-sm font-medium tracking-wide">本週預約</p>
              <p className="text-3xl font-bold mt-2 text-secondary-800">{stats.week_bookings}</p>
            </div>
            <div className="bg-purple-50 text-purple-500 rounded-full p-3 shadow-sm border border-purple-100 group-hover:bg-purple-100 transition-colors">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        <div className="stat-card group bg-white border-l-4 border-green-500 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-500 text-sm font-medium tracking-wide">本月預約</p>
              <p className="text-3xl font-bold mt-2 text-secondary-800">{stats.month_bookings}</p>
            </div>
            <div className="bg-green-50 text-green-500 rounded-full p-3 shadow-sm border border-green-100 group-hover:bg-green-100 transition-colors">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="stat-card group bg-white border-l-4 border-amber-500 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-500 text-sm font-medium tracking-wide">本月營收</p>
              <p className="text-3xl font-bold mt-2 text-primary-600 text-shadow-glow">NT$ {stats.month_revenue.toLocaleString()}</p>
            </div>
            <div className="bg-amber-50 text-amber-500 rounded-full p-3 shadow-sm border border-amber-100 group-hover:bg-amber-100 transition-colors">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Stylists */}
        <div className="card group bg-white">
          <h2 className="text-lg font-serif font-bold text-secondary-800 mb-6 border-b border-stone-100 pb-4 tracking-wide">熱門設計師</h2>
          <div className="space-y-4">
            {stats.top_stylists && stats.top_stylists.length > 0 ? (
              stats.top_stylists.map((stylist) => (
                <div key={stylist.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors border border-stone-100">
                  <div>
                    <p className="font-bold text-secondary-800">{stylist.name}</p>
                    <p className="text-sm text-secondary-500">{stylist.booking_count} 次預約</p>
                  </div>
                  {stylist.revenue && stylist.revenue > 0 && (
                    <span className="font-bold text-primary-600">NT$ {stylist.revenue.toLocaleString()}</span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-secondary-400 text-center py-4">暫無資料</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card group bg-white">
          <h2 className="text-lg font-serif font-bold text-secondary-800 mb-6 border-b border-stone-100 pb-4 tracking-wide">快速操作</h2>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/services')}
              className="w-full p-4 bg-stone-50 hover:bg-blue-50 hover:border-blue-200 border border-stone-100 rounded-xl transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl group-hover:scale-110 transition-transform">💇</span>
                <div>
                  <p className="font-bold text-secondary-800 group-hover:text-blue-600 transition-colors">管理服務項目</p>
                  <p className="text-sm text-secondary-500">新增、編輯服務</p>
                </div>
              </div>
            </button>
            <button
              onClick={() => router.push('/stylists')}
              className="w-full p-4 bg-stone-50 hover:bg-purple-50 hover:border-purple-200 border border-stone-100 rounded-xl transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl group-hover:scale-110 transition-transform">👨‍🎨</span>
                <div>
                  <p className="font-bold text-secondary-800 group-hover:text-purple-600 transition-colors">管理設計師</p>
                  <p className="text-sm text-secondary-500">設計師資料與排班</p>
                </div>
              </div>
            </button>
            <button
              onClick={() => router.push('/bookings')}
              className="w-full p-4 bg-stone-50 hover:bg-green-50 hover:border-green-200 border border-stone-100 rounded-xl transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl group-hover:scale-110 transition-transform">📅</span>
                <div>
                  <p className="font-bold text-secondary-800 group-hover:text-green-600 transition-colors">預約管理</p>
                  <p className="text-sm text-secondary-500">查看與管理預約</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="card group bg-white">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
          <h2 className="text-lg font-serif font-bold text-secondary-800 tracking-wide">最新預約</h2>
          <button
            onClick={() => router.push('/bookings')}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
          >
            查看全部 →
          </button>
        </div>

        {recentBookings.length === 0 ? (
          <div className="text-center py-8 text-secondary-400">
            <p>目前沒有預約記錄</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="text-left py-3 px-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">客戶</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">服務</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">設計師</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">日期時間</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">狀態</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-stone-50 transition-colors group">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-bold text-secondary-800">{booking.user?.name || '沒有姓名'}</p>
                        <p className="text-sm text-secondary-500">{booking.user?.phone || '沒有電話'}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-secondary-600">
                      {booking.services && booking.services.length > 0
                        ? booking.services.map((s: any) => s.name).join(', ')
                        : '沒有服務'}
                    </td>
                    <td className="py-4 px-4 text-secondary-600">{booking.stylist?.name || '沒有設計師'}</td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-secondary-600 text-sm font-medium bg-stone-50 px-2 py-1 rounded-md inline-block">{new Date(booking.booking_date).toLocaleDateString('zh-TW')}</p>
                        <p className="text-xs text-secondary-400 mt-1">{booking.start_time}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(booking.status)} shadow-sm`}>
                        {getStatusText(booking.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
