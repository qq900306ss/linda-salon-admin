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
    <div className="w-64 bg-admin-sidebar h-screen fixed left-0 top-0 flex flex-col shadow-2xl z-50">
      {/* Logo */}
      <div className="p-8 border-b border-white/5">
        <h1 className="text-2xl font-serif font-bold text-white tracking-wide">✨ Linda Salon</h1>
        <p className="text-stone-400 text-xs mt-2 tracking-widest uppercase">Admin Portal</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 overflow-y-auto custom-scrollbar">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = router.pathname === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={`flex items-center gap-4 px-6 py-3.5 mx-3 rounded-xl cursor-pointer transition-all duration-300 group ${isActive
                      ? 'bg-primary-500 text-white shadow-lg shadow-primary-900/20 translate-x-1'
                      : 'text-stone-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
                    }`}
                >
                  <span className={`text-xl transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {item.icon}
                  </span>
                  <span className="font-medium tracking-wide">{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Admin Info */}
      <div className="p-4 m-4 bg-white/5 rounded-xl border border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-serif font-bold text-lg shadow-lg">
            {user?.name?.[0] || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name || 'Admin'}</p>
            <p className="text-xs text-stone-400 truncate">{user?.role === 'admin' ? '系統管理員' : '一般使用者'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs font-medium transition-colors border border-stone-700"
        >
          登出系統
        </button>
      </div>
    </div>
  );
}
