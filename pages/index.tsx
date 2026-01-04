import { useEffect, useState } from 'react';
import Layout from '../components/Layout/Layout';
import StatCard from '../components/Dashboard/StatCard';
import { mockStatistics } from '../data/mockStatistics';
import { mockBookings } from '../data/mockBookings';

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = mockStatistics;
  const recentBookings = mockBookings.slice(0, 5);

  if (!mounted) {
    return null;
  }

  return (
    <Layout title="儀表板" subtitle="歡迎回到琳達髮廊管理系統">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="今日預約"
          value={stats.todayBookings}
          icon="📅"
          change="+2 較昨日"
          changeType="positive"
        />
        <StatCard
          title="本週預約"
          value={stats.weekBookings}
          icon="📊"
          change="+8% 較上週"
          changeType="positive"
        />
        <StatCard
          title="本月營收"
          value={`NT$ ${stats.monthRevenue.toLocaleString()}`}
          icon="💰"
          change="+12% 較上月"
          changeType="positive"
        />
        <StatCard
          title="今日營收"
          value={`NT$ ${stats.todayRevenue.toLocaleString()}`}
          icon="💵"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Popular Services */}
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4">熱門服務</h2>
          <div className="space-y-3">
            {stats.popularServices.map((service, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{service.name}</span>
                    <span className="text-sm text-gray-600">{service.count} 次</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full"
                      style={{ width: `${service.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Stylists */}
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4">設計師業績排行</h2>
          <div className="space-y-4">
            {stats.topStylists.map((stylist, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-600">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{stylist.name}</p>
                    <p className="text-sm text-gray-600">{stylist.bookings} 個預約</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary-600">NT$ {stylist.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="card mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">每日營收趨勢</h2>
        <div className="flex items-end justify-between gap-2 h-48">
          {stats.revenueByDay.map((day, index) => {
            const maxRevenue = Math.max(...stats.revenueByDay.map(d => d.revenue));
            const height = (day.revenue / maxRevenue) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center">
                  <span className="text-xs text-gray-600 mb-1">{day.bookings}</span>
                  <div
                    className="w-full bg-primary-500 rounded-t hover:bg-primary-600 transition-colors cursor-pointer"
                    style={{ height: `${height}%`, minHeight: '20px' }}
                    title={`NT$ ${day.revenue.toLocaleString()}`}
                  />
                </div>
                <span className="text-xs text-gray-600">{day.date}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">最新預約</h2>
          <a href="/bookings" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            查看全部 →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">客戶</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">服務</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">設計師</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">日期時間</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">狀態</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">金額</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((booking) => (
                <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{booking.customerName}</p>
                      <p className="text-sm text-gray-600">{booking.customerPhone}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{booking.serviceName}</td>
                  <td className="py-3 px-4 text-gray-700">{booking.stylistName}</td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-gray-900">{booking.date}</p>
                      <p className="text-sm text-gray-600">{booking.time}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-700'
                          : booking.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : booking.status === 'completed'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {booking.status === 'confirmed'
                        ? '已確認'
                        : booking.status === 'pending'
                        ? '待確認'
                        : booking.status === 'completed'
                        ? '已完成'
                        : '已取消'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-gray-900">
                    NT$ {booking.price.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
