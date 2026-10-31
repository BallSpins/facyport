'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/report', label: 'Daftar Laporan' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-white text-black p-4 flex flex-col shadow-md sticky top-0 shrink-0">
      <div className="text-xl font-bold mb-8 px-2 flex flex-row items-center">
        <svg
          className="w-8 h-8 text-blue-600 mr-2"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 3L1 9l11 6 9-4.917V17h2V9L12 3z..." />
        </svg>
        <div className='text-blue-600 flex mr-1'>Facyport</div>
        Admin
      </div>
      <nav className="flex flex-col space-y-2.5">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3 py-2 rounded-lg text-sm transition-colors bg-gray-100 ${
              pathname === item.href
                ? 'bg-gray-200 shadow-md text-black font-semibold'
                : 'text-black hover:bg-gray-200'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}