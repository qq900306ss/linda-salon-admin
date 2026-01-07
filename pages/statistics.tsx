import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { statisticsService, DashboardStats } from '../lib/services/statistics.service';
import Layout from '../components/Layout/Layout';

export default function StatisticsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

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
      fetchStats();
    }
  }, [authLoading, isAuthenticated, user, router]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const data = await statisticsService.getDashboard();
      setStats(data);
      setError('');
    } catch (err: any) {
      console.error('Failed to fetch statistics:', err);
      setError(err.response?.data?.error || '載入統計資料失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `NT$ ${amount.toLocaleString()}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-TW', {
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchStats}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            重試
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">統計報表</h1>
            <p className="text-gray-600 mt-1">查看營運數據與分析報告</p>
          </div>
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            重新整理
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">今日預約</p>
                <p className="text-3xl font-bold text-primary-600">{stats?.today_bookings || 0}</p>
              </div>
              <div className="text-4xl">📅</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">本週預約</p>
                <p className="text-3xl font-bold text-primary-600">{stats?.week_bookings || 0}</p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">本月預約</p>
                <p className="text-3xl font-bold text-primary-600">{stats?.month_bookings || 0}</p>
              </div>
              <div className="text-4xl">📈</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">今日營收</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats?.today_revenue || 0)}</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>
        </div>

        {/* Revenue Stats */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">營收概覽</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">本月總營收</span>
              <span className="text-2xl font-bold text-green-600">
                {formatCurrency(stats?.month_revenue || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600">月平均單筆金額</span>
              <span className="text-lg font-semibold text-gray-900">
                {formatCurrency(
                  stats?.month_bookings && stats?.month_bookings > 0
                    ? Math.round((stats?.month_revenue || 0) / stats.month_bookings)
                    : 0
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Revenue Trend */}
        {stats?.revenue_by_day && stats.revenue_by_day.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">近期營收趨勢 (最近30天)</h2>
            <div className="space-y-2">
              {stats.revenue_by_day.slice(-10).reverse().map((day, index) => {
                const maxRevenue = Math.max(...(stats.revenue_by_day?.map(d => d.revenue) || [1]));
                const percentage = (day.revenue / maxRevenue) * 100;

                return (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-20 text-sm text-gray-600">{formatDate(day.date)}</div>
                    <div className="flex-1">
                      <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-end pr-2"
                          style={{ width: `${Math.max(percentage, 5)}%` }}
                        >
                          {day.revenue > 0 && (
                            <span className="text-xs text-white font-medium">
                              {formatCurrency(day.revenue)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="w-24 text-right text-sm text-gray-500">
                      {day.bookings || 0} 筆預約
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Popular Services */}
          {stats?.popular_services && stats.popular_services.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">熱門服務 (本月)</h2>
              <div className="space-y-3">
                {stats.popular_services.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-orange-400' :
                        'bg-primary-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{service.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary-600">{service.count}</div>
                      <div className="text-xs text-gray-500">次預約</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Stylists */}
          {stats?.top_stylists && stats.top_stylists.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">熱門設計師 (本月)</h2>
              <div className="space-y-3">
                {stats.top_stylists.map((stylist, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-orange-400' :
                        'bg-primary-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{stylist.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary-600">{stylist.booking_count}</div>
                      <div className="text-xs text-gray-500">次預約</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {(!stats?.popular_services || stats.popular_services.length === 0) &&
         (!stats?.top_stylists || stats.top_stylists.length === 0) && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">暫無統計資料</h3>
            <p className="text-gray-600">當有預約資料後，這裡會顯示詳細的統計分析</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
