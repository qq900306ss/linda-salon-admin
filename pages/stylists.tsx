import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { stylistService, Stylist } from '../lib/services/stylist.service';
import Layout from '../components/Layout/Layout';

export default function StylistsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStylist, setEditingStylist] = useState<Stylist | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    specialty: '',
    experience: 0,
    avatar: '',
    is_active: true,
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
      fetchStylists();
    }
  }, [authLoading, isAuthenticated, user, router]);

  const fetchStylists = async () => {
    try {
      setIsLoading(true);
      const data = await stylistService.getAll();
      setStylists(data);
      setError('');
    } catch (err: any) {
      console.error('Failed to fetch stylists:', err);
      setError(err.response?.data?.error || '載入設計師資料失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingStylist(null);
    setFormData({
      name: '',
      description: '',
      specialty: '',
      experience: 0,
      avatar: '',
      is_active: true,
    });
    setShowModal(true);
  };

  const handleEdit = (stylist: Stylist) => {
    setEditingStylist(stylist);
    setFormData({
      name: stylist.name,
      description: stylist.description || '',
      specialty: stylist.specialty || '',
      experience: stylist.experience || 0,
      avatar: stylist.avatar || '',
      is_active: stylist.is_active,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('確定要刪除這位設計師嗎？')) {
      return;
    }

    try {
      await stylistService.delete(id);
      alert('刪除成功');
      fetchStylists();
    } catch (err: any) {
      alert(err.response?.data?.error || '刪除失敗');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingStylist) {
        await stylistService.update(editingStylist.id, formData);
        alert('更新成功');
      } else {
        await stylistService.create(formData);
        alert('新增成功');
      }
      setShowModal(false);
      fetchStylists();
    } catch (err: any) {
      alert(err.response?.data?.error || '操作失敗');
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

  return (
    <Layout title="Stylists Management" subtitle="Manage stylist profiles and schedules">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Action Bar */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <p className="text-gray-700 text-lg">
            <span className="font-semibold">{stylists.length}</span> 位設計師
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md hover:shadow-lg font-medium"
        >
          + 新增設計師
        </button>
      </div>

      {/* Stylists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stylists.map((stylist) => (
          <div key={stylist.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center overflow-hidden">
                    {stylist.avatar ? (
                      <img src={stylist.avatar} alt={stylist.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">👨‍🎨</span>
                    )}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white ${
                    stylist.is_active ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900 mb-1">{stylist.name}</h3>
                  <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                    stylist.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {stylist.is_active ? '在職' : '離職'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              {stylist.description && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 font-medium mb-1">簡介</p>
                  <p className="text-sm text-gray-800">{stylist.description}</p>
                </div>
              )}
              {stylist.specialty && (
                <div className="bg-indigo-50 rounded-lg p-3">
                  <p className="text-xs text-indigo-600 font-medium mb-1">專長</p>
                  <p className="text-sm text-gray-800">{stylist.specialty}</p>
                </div>
              )}
              {stylist.experience !== undefined && stylist.experience > 0 && (
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-lg">⭐</span>
                  <span className="text-sm font-medium">{stylist.experience} 年經驗</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(stylist)}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all text-sm font-medium shadow-sm"
              >
                編輯
              </button>
              <button
                onClick={() => router.push(`/stylists/${stylist.id}/schedule`)}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all text-sm font-medium shadow-sm"
              >
                排班
              </button>
              <button
                onClick={() => handleDelete(stylist.id)}
                className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all text-sm font-medium shadow-sm"
              >
                刪除
              </button>
            </div>
          </div>
        ))}
      </div>

      {stylists.length === 0 && !isLoading && (
        <div className="text-center py-16 bg-white rounded-xl shadow-md border border-gray-100">
          <div className="text-6xl mb-4">👨‍🎨</div>
          <p className="text-gray-500 text-lg mb-6">目前沒有設計師資料</p>
          <button
            onClick={handleCreate}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md hover:shadow-lg font-medium"
          >
            + 新增第一位設計師
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingStylist ? '編輯設計師' : '新增設計師'}
              </h2>
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
                  姓名 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="輸入設計師姓名"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  簡介
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                  placeholder="簡短介紹設計師的特色..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  專長
                </label>
                <input
                  type="text"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  placeholder="例如：剪髮、染髮、燙髮"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  經驗年資
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  頭像 URL
                </label>
                <input
                  type="text"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="flex items-center pt-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="is_active" className="ml-3 text-sm font-medium text-gray-800 cursor-pointer">
                  在職中
                </label>
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
                  {editingStylist ? '更新' : '新增'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
