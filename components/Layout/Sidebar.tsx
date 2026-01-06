import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  name: string;
  path: string;
  icon: string;
}

const navItems: NavItem[] = [
  { name: '儀表板', path: '/', icon: '📊' },
  { name: '行事曆', path: '/calendar', icon: '📅' },
  { name: '預約管理', path: '/bookings', icon: '📋' },
  { name: '服務管理', path: '/services', icon: '💇‍♀️' },
  { name: '設計師管理', path: '/stylists', icon: '👥' },
  { name: '會員管理', path: '/customers', icon: '👤' },
  { name: '統計報表', path: '/statistics', icon: '📈' },
];

export default function Sidebar() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="w-64 bg-gradient-to-b from-indigo-900 to-indigo-800 h-screen fixed left-0 top-0 flex flex-col shadow-xl">
      {/* Logo */}
      <div className="p-6 border-b border-indigo-700">
        <h1 className="text-2xl font-bold text-white">✨ Linda Salon</h1>
        <p className="text-indigo-300 text-sm mt-1">管理後台</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = router.pathname === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${
                    isActive
                      ? 'bg-indigo-700 text-white shadow-lg'
                      : 'text-indigo-200 hover:bg-indigo-700/50 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Admin Info */}
      <div className="p-4 border-t border-indigo-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {user?.name?.[0] || 'A'}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">{user?.name || 'Admin'}</p>
            <p className="text-xs text-indigo-300">{user?.role === 'admin' ? '管理員' : '使用者'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 bg-indigo-700 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          登出
        </button>
      </div>
    </div>
  );
}
