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
  { name: '資源管理', path: '/assets', icon: '🎨' },
];

export default function Sidebar() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="w-64 bg-white h-screen fixed left-0 top-0 flex flex-col shadow-xl z-50 border-r border-stone-100">
      {/* Logo */}
      <div className="p-8 border-b border-stone-100">
        <h1 className="text-2xl font-serif font-bold text-secondary-800 tracking-wide">✨ Linda Salon</h1>
        <p className="text-secondary-400 text-xs mt-2 tracking-widest uppercase">Admin Portal</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 overflow-y-auto custom-scrollbar">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = router.pathname === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <div className={`sidebar-item group ${isActive ? 'active' : ''}`}>
                  <span className={`text-xl transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {item.icon}
                  </span>
                  <span className="font-medium tracking-wide">{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Admin Info */}
      <div className="p-4 m-4 bg-stone-50 rounded-xl border border-stone-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-serif font-bold text-lg shadow-md">
            {user?.name?.[0] || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-secondary-800 truncate">{user?.name || 'Admin'}</p>
            <p className="text-xs text-secondary-500 truncate">{user?.role === 'admin' ? '系統管理員' : '一般使用者'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 bg-white hover:bg-stone-50 text-secondary-600 rounded-lg text-xs font-medium transition-colors border border-stone-200 shadow-sm"
        >
          登出系統
        </button>
      </div>
    </div>
  );
}
