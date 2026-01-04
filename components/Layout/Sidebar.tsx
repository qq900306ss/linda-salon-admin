import Link from 'next/link';
import { useRouter } from 'next/router';

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
  { name: '系統設定', path: '/settings', icon: '⚙️' },
];

export default function Sidebar() {
  const router = useRouter();

  return (
    <div className="w-64 bg-admin-sidebar h-screen fixed left-0 top-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-white">✨ 琳達髮廊</h1>
        <p className="text-gray-400 text-sm mt-1">管理後台</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = router.pathname === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <div className={`sidebar-item ${isActive ? 'active' : ''}`}>
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Admin Info */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3 text-gray-300">
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
            A
          </div>
          <div>
            <p className="text-sm font-medium text-white">Admin</p>
            <p className="text-xs text-gray-400">管理員</p>
          </div>
        </div>
      </div>
    </div>
  );
}
