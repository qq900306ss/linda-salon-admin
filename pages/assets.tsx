import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout/Layout';
import api from '../lib/api';

interface BrandingConfig {
  logo: string;
  logo_dark: string;
  favicon: string;
  name: string;
  short_name: string;
  description: string;
  theme_color: string;
  background_color: string;
}

interface PWAIconConfig {
  icon_72: string;
  icon_96: string;
  icon_128: string;
  icon_144: string;
  icon_152: string;
  icon_192: string;
  icon_384: string;
  icon_512: string;
}

export default function AssetsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [branding, setBranding] = useState<BrandingConfig>({
    logo: '',
    logo_dark: '',
    favicon: '',
    name: 'Linda 髮廊',
    short_name: 'Linda',
    description: '專業美髮服務，打造您的完美造型',
    theme_color: '#8B5CF6',
    background_color: '#FFFFFF',
  });

  const [icons, setIcons] = useState<PWAIconConfig>({
    icon_72: '',
    icon_96: '',
    icon_128: '',
    icon_144: '',
    icon_152: '',
    icon_192: '',
    icon_384: '',
    icon_512: '',
  });

  const [uploadingFile, setUploadingFile] = useState<string>('');

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
      fetchSettings();
    }
  }, [authLoading, isAuthenticated, user, router]);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const [brandingRes, iconsRes] = await Promise.all([
        api.get('/api/v1/settings/branding'),
        api.get('/api/v1/settings/pwa/icons'),
      ]);
      setBranding(brandingRes.data);
      setIcons(iconsRes.data);
    } catch (err: any) {
      console.error('Failed to fetch settings:', err);
      setError(err.response?.data?.error || '載入設定失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File, folder: string, field: string) => {
    try {
      setUploadingFile(field);
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(`/api/v1/upload/image?folder=${folder}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.url;
    } catch (err: any) {
      console.error('Upload failed:', err);
      throw new Error(err.response?.data?.error || '上傳失敗');
    } finally {
      setUploadingFile('');
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: keyof BrandingConfig) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await handleFileUpload(file, 'logos', field);
      setBranding({ ...branding, [field]: url });
      setSuccess(`${field} 上傳成功`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: keyof PWAIconConfig) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await handleFileUpload(file, 'icons', field);
      setIcons({ ...icons, [field]: url });
      setSuccess(`${field} 上傳成功`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleSaveBranding = async () => {
    try {
      setIsSaving(true);
      await api.put('/api/v1/admin/settings/branding', branding);
      setSuccess('品牌設定儲存成功');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || '儲存失敗');
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveIcons = async () => {
    try {
      setIsSaving(true);
      await api.put('/api/v1/admin/settings/pwa/icons', icons);
      setSuccess('PWA 圖標儲存成功');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || '儲存失敗');
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <Layout title="資源管理" subtitle="載入中...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="資源管理" subtitle="管理 Logo、圖標和品牌設定">
      <div className="space-y-6">
        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Branding Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">品牌設定</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">品牌名稱</label>
              <input
                type="text"
                value={branding.name}
                onChange={(e) => setBranding({ ...branding, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">簡短名稱</label>
              <input
                type="text"
                value={branding.short_name}
                onChange={(e) => setBranding({ ...branding, short_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">品牌描述</label>
              <textarea
                value={branding.description}
                onChange={(e) => setBranding({ ...branding, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">主題顏色</label>
                <input
                  type="color"
                  value={branding.theme_color}
                  onChange={(e) => setBranding({ ...branding, theme_color: e.target.value })}
                  className="w-full h-12 rounded-lg border border-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">背景顏色</label>
                <input
                  type="color"
                  value={branding.background_color}
                  onChange={(e) => setBranding({ ...branding, background_color: e.target.value })}
                  className="w-full h-12 rounded-lg border border-gray-300"
                />
              </div>
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                主要 Logo
                {branding.logo && <span className="ml-2 text-xs text-green-600">✓ 已上傳</span>}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleLogoUpload(e, 'logo')}
                disabled={uploadingFile === 'logo'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              {branding.logo && (
                <div className="mt-2">
                  <img src={branding.logo} alt="Logo" className="h-16 object-contain" />
                </div>
              )}
            </div>

            <button
              onClick={handleSaveBranding}
              disabled={isSaving}
              className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 font-semibold disabled:bg-gray-400"
            >
              {isSaving ? '儲存中...' : '儲存品牌設定'}
            </button>
          </div>
        </div>

        {/* PWA Icons */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">PWA 應用程式圖標</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(icons).map(([key, value]) => {
              const size = key.replace('icon_', '');
              return (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    圖標 {size}x{size}
                    {value && <span className="ml-2 text-xs text-green-600">✓</span>}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleIconUpload(e, key as keyof PWAIconConfig)}
                    disabled={uploadingFile === key}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  {value && (
                    <div className="mt-2">
                      <img src={value} alt={`Icon ${size}x${size}`} className="h-12 object-contain" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={handleSaveIcons}
            disabled={isSaving}
            className="w-full mt-6 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 font-semibold disabled:bg-gray-400"
          >
            {isSaving ? '儲存中...' : '儲存 PWA 圖標'}
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-2">📝 使用說明</h3>
          <ul className="list-disc list-inside text-blue-800 space-y-1 text-sm">
            <li>上傳圖片後，系統會自動儲存到 S3</li>
            <li>PWA 圖標建議使用正方形圖片，系統會自動縮放</li>
            <li>主題顏色會影響手機上 PWA 應用程式的外觀</li>
            <li>更改設定後需點擊「儲存」按鈕才會生效</li>
            <li>前台網站會自動使用這些設定</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
