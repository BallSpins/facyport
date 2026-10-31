'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between">
      <Link href="/" className="text-xl font-bold text-blue-600">
        FacyPort
      </Link>
      <div className="flex items-center space-x-6">
        <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
          Beranda
        </Link>
        <Link href="/form" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
          Form Laporan
        </Link>
        <Link href="/informasi" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
          Informasi
        </Link>
        <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          Login Admin
        </Link>
      </div>
    </nav>
  );
}

