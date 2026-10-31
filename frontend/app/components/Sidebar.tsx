'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const menuItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/report', label: 'Daftar Report' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white p-4 flex flex-col justify-between">
      <div>
        <div className="text-xl font-bold mb-8 px-2">FacyPort Admin</div>
        <nav className="flex flex-col space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 rounded-lg text-sm ${
                pathname === item.href
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="pt-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-800 rounded-lg transition"
        >
          Keluar (Logout)
        </button>
      </div>
    </aside>
  );
}
