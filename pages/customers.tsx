import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { userService, User } from '../lib/services/user.service';
import { Booking } from '../lib/services/booking.service';
import Layout from '../components/Layout/Layout';

export default function CustomersPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [customers, setCustomers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [customerBookings, setCustomerBookings] = useState<Booking[]>([]);
  const [showBookings, setShowBookings] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);

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
      fetchCustomers();
    }
  }, [authLoading, isAuthenticated, user, router]);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getAll(100, 0);
      setCustomers(data.users);
      setError('');
    } catch (err: any) {
      console.error('Failed to fetch customers:', err);
      setError(err.response?.data?.error || '載入會員資料失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewBookings = async (customer: User) => {
    setSelectedCustomer(customer);
    setShowBookings(true);
    setLoadingBookings(true);
    try {
      const bookings = await userService.getUserBookings(customer.id);
      setCustomerBookings(bookings);
    } catch (err: any) {
      console.error('Failed to fetch customer bookings:', err);
      alert(err.response?.data?.error || '載入預約記錄失敗');
    } finally {
      setLoadingBookings(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
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
      'confirmed': 'bg-green-100 text-green-700',
      'pending': 'bg-yellow-100 text-yellow-700',
      'completed': 'bg-blue-100 text-blue-700',
      'cancelled': 'bg-gray-100 text-gray-700',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-700';
  };

  const getRoleText = (role: string) => {
    return role === 'admin' ? '管理員' : '一般會員';
  };

  const getOAuthProvider = (provider?: string) => {
    if (!provider) return '電子郵件';
    return provider === 'google' ? 'Google' : provider === 'line' ? 'LINE' : provider;
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
            <h1 className="text-3xl font-bold text-gray-900">會員管理</h1>
            <p className="text-gray-600 mt-1">管理所有註冊會員資料</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">總會員數</p>
                <p className="text-3xl font-bold text-primary-600">{customers.length}</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Google 登入</p>
                <p className="text-3xl font-bold text-primary-600">
                  {customers.filter(c => c.oauth_provider === 'google').length}
                </p>
              </div>
              <div className="text-4xl">🔵</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">LINE 登入</p>
                <p className="text-3xl font-bold text-primary-600">
                  {customers.filter(c => c.oauth_provider === 'line').length}
                </p>
              </div>
              <div className="text-4xl">🟢</div>
            </div>
          </div>
        </div>

        {/* Customer List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    會員編號
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    姓名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    電子郵件
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    電話
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    登入方式
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    角色
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    註冊日期
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{customer.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {customer.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {customer.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {customer.phone || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {getOAuthProvider(customer.oauth_provider)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        customer.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {getRoleText(customer.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(customer.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleViewBookings(customer)}
                        className="text-primary-600 hover:text-primary-800 font-medium"
                      >
                        查看預約記錄
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Booking History Modal */}
      {showBookings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCustomer?.name} 的預約記錄
                </h2>
                <button
                  onClick={() => {
                    setShowBookings(false);
                    setSelectedCustomer(null);
                    setCustomerBookings([]);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <p className="text-gray-600 mt-1">
                會員編號: #{selectedCustomer?.id} | {selectedCustomer?.email}
              </p>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {loadingBookings ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              ) : customerBookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  此會員尚無預約記錄
                </div>
              ) : (
                <div className="space-y-4">
                  {customerBookings.map((booking) => (
                    <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="text-sm text-gray-500">預約編號 #{booking.id}</span>
                          <h3 className="font-semibold text-gray-900 mt-1">
                            {booking.services.map(s => s.name).join(' + ')}
                          </h3>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {getStatusText(booking.status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">設計師:</span>
                          <span className="ml-2 text-gray-900">{booking.stylist?.name || '-'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">日期:</span>
                          <span className="ml-2 text-gray-900">{formatDate(booking.booking_date)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">時間:</span>
                          <span className="ml-2 text-gray-900">{booking.start_time} - {booking.end_time}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">價格:</span>
                          <span className="ml-2 text-gray-900 font-medium">NT$ {booking.price}</span>
                        </div>
                      </div>

                      {booking.notes && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <span className="text-gray-500 text-sm">備註:</span>
                          <p className="text-gray-900 text-sm mt-1">{booking.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
