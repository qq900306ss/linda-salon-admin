import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';
import { stylistService, Stylist, StylistSchedule } from '../../../lib/services/stylist.service';
import Layout from '../../../components/Layout/Layout';

export default function StylistSchedulePage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [stylist, setStylist] = useState<Stylist | null>(null);
  const [schedules, setSchedules] = useState<StylistSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    day_of_week: 1,
    start_time: '09:00',
    end_time: '18:00',
  });

  const dayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

  useEffect(() => {
    if (!authLoading && id) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      if (user?.role !== 'admin') {
        alert('需要管理員權限');
        router.push('/login');
        return;
      }
      fetchData();
    }
  }, [authLoading, isAuthenticated, user, router, id]);

  const fetchData = async () => {
    if (!id || typeof id !== 'string') return;

    try {
      setIsLoading(true);
      const [stylistData, schedulesData] = await Promise.all([
        stylistService.getById(parseInt(id)),
        stylistService.getSchedules(parseInt(id)),
      ]);
      setStylist(stylistData);
      setSchedules(schedulesData);
      setError('');
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
      setError(err.response?.data?.error || '載入資料失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      day_of_week: 1,
      start_time: '09:00',
      end_time: '18:00',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || typeof id !== 'string') return;

    try {
      await stylistService.createSchedule(parseInt(id), formData);
      alert('新增成功');
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || '操作失敗');
    }
  };

  const handleDelete = async (scheduleId: number) => {
    if (!confirm('確定要刪除這個排班嗎？')) {
      return;
    }

    try {
      await stylistService.deleteSchedule(scheduleId);
      alert('刪除成功');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || '刪除失敗');
    }
  };

  // Group schedules by day
  const groupedSchedules = schedules.reduce((acc, schedule) => {
    if (!acc[schedule.day_of_week]) {
      acc[schedule.day_of_week] = [];
    }
    acc[schedule.day_of_week].push(schedule);
    return acc;
  }, {} as Record<number, StylistSchedule[]>);

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

  if (!stylist) {
    return (
      <Layout title="Schedule Management" subtitle="設計師未找到">
        <div className="text-center py-12">
          <p className="text-gray-600">設計師不存在</p>
          <button
            onClick={() => router.push('/stylists')}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            返回設計師列表
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${stylist.name} - 排班管理`} subtitle="設定設計師的工作時間">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/stylists')}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ← 返回
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center">
              {stylist.avatar ? (
                <img src={stylist.avatar} alt={stylist.name} className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="text-2xl">👨‍🎨</span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{stylist.name}</h2>
              <p className="text-sm text-gray-600">{stylist.specialty || '專業設計師'}</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleCreate}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md hover:shadow-lg font-medium"
        >
          + 新增排班
        </button>
      </div>

      {/* Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[0, 1, 2, 3, 4, 5, 6].map((day) => {
          const daySchedules = groupedSchedules[day] || [];
          return (
            <div key={day} className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-gray-900">{dayNames[day]}</h3>
                <span className="text-2xl">
                  {day === 0 || day === 6 ? '🌅' : '💼'}
                </span>
              </div>

              {daySchedules.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <p className="text-sm">休息</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {daySchedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="bg-indigo-50 rounded-lg p-3 border border-indigo-100"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-indigo-900">
                            {schedule.start_time} - {schedule.end_time}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            schedule.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {schedule.is_active ? '啟用' : '停用'}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDelete(schedule.id)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {schedules.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl shadow-md border border-gray-100 mt-6">
          <div className="text-6xl mb-4">📅</div>
          <p className="text-gray-500 text-lg mb-6">尚未設定任何排班</p>
          <button
            onClick={handleCreate}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md hover:shadow-lg font-medium"
          >
            + 新增第一個排班
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">新增排班</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  星期 *
                </label>
                <select
                  required
                  value={formData.day_of_week}
                  onChange={(e) => setFormData({ ...formData, day_of_week: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  {dayNames.map((name, index) => (
                    <option key={index} value={index}>{name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  開始時間 *
                </label>
                <input
                  type="time"
                  required
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  結束時間 *
                </label>
                <input
                  type="time"
                  required
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-5 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-5 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md hover:shadow-lg"
                >
                  新增
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
