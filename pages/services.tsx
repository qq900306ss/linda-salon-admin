import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { serviceService, Service } from '../lib/services/service.service';
import Layout from '../components/Layout/Layout';

export default function ServicesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    duration: 30,
    price: 0,
    image_url: '',
    is_active: true,
  });

  // Get unique categories from existing services for autocomplete
  const existingCategories = Array.from(new Set(services.map(s => s.category).filter(Boolean)));

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
      fetchServices();
    }
  }, [authLoading, isAuthenticated, user, router]);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const data = await serviceService.getAll();
      setServices(data);
      setError('');
    } catch (err: any) {
      console.error('Failed to fetch services:', err);
      setError(err.response?.data?.error || '載入服務資料失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      duration: 30,
      price: 0,
      image_url: '',
      is_active: true,
    });
    setShowModal(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      category: service.category,
      duration: service.duration,
      price: service.price,
      image_url: service.image_url || '',
      is_active: service.is_active,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('確定要刪除這個服務嗎？')) {
      return;
    }

    try {
      await serviceService.delete(id);
      alert('刪除成功');
      fetchServices();
    } catch (err: any) {
      alert(err.response?.data?.error || '刪除失敗');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingService) {
        await serviceService.update(editingService.id, formData);
        alert('更新成功');
      } else {
        await serviceService.create(formData);
        alert('新增成功');
      }
      setShowModal(false);
      fetchServices();
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
    <Layout title="Services Management" subtitle="Manage salon services and pricing">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Action Bar */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <p className="text-gray-700 text-lg">
            <span className="font-semibold">{services.length}</span> 項服務
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md hover:shadow-lg font-medium"
        >
          + 新增服務
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div key={service.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
            <div className="mb-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-xl text-gray-900">{service.name}</h3>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  service.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {service.is_active ? '啟用' : '停用'}
                </span>
              </div>
              <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700">
                {service.category}
              </span>
            </div>

            <div className="space-y-3 mb-5">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 font-medium mb-1">描述</p>
                <p className="text-sm text-gray-800">{service.description}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="bg-blue-50 rounded-lg px-3 py-2 flex-1 mr-2">
                  <p className="text-xs text-blue-600 font-medium mb-1">時長</p>
                  <p className="text-sm font-bold text-gray-800">{service.duration} 分鐘</p>
                </div>
                <div className="bg-amber-50 rounded-lg px-3 py-2 flex-1">
                  <p className="text-xs text-amber-600 font-medium mb-1">價格</p>
                  <p className="text-sm font-bold text-gray-800">NT$ {service.price}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(service)}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all text-sm font-medium shadow-sm"
              >
                編輯
              </button>
              <button
                onClick={() => handleDelete(service.id)}
                className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all text-sm font-medium shadow-sm"
              >
                刪除
              </button>
            </div>
          </div>
        ))}
      </div>

      {services.length === 0 && !isLoading && (
        <div className="text-center py-16 bg-white rounded-xl shadow-md border border-gray-100">
          <div className="text-6xl mb-4">💇</div>
          <p className="text-gray-500 text-lg mb-6">目前沒有服務資料</p>
          <button
            onClick={handleCreate}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md hover:shadow-lg font-medium"
          >
            + 新增第一個服務
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingService ? '編輯服務' : '新增服務'}
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
                  服務名稱 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="例如：剪髮"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  類別 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  list="category-suggestions"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="例如：造型服務、染燙服務、護理服務"
                />
                <datalist id="category-suggestions">
                  {existingCategories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
                <p className="text-xs text-gray-500 mt-1">可自由輸入新類別，或從現有類別中選擇</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  描述 *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                  placeholder="簡短描述服務內容..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    時長（分鐘）*
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    價格（NT$）*
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  圖片 URL
                </label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
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
                  啟用服務
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
                  {editingService ? '更新' : '新增'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
