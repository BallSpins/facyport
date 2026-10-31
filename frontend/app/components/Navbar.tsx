'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { name: 'Beranda', href: '/' },
    { name: 'Form Laporan', href: '/form' },
    { name: 'Informasi', href: '/informasi' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between relative z-50">
      {/* Logo */}
      <Link href="/" className="flex items-center space-x-3 text-xl font-bold text-blue-600">
        <svg
          className="w-8 h-8 text-blue-600"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 3L1 9l11 6 9-4.917V17h2V9L12 3z..." />
        </svg>
        <span>Facyport</span>
      </Link>

      {/* Menu Desktop dengan Indikator Garis Animasi */}
      <div className="hidden md:flex items-center space-x-8 relative">
        {navLinks.map((link) => {
          const isActive = mounted && pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative py-2 font-medium transition-colors duration-300 ${
                isActive ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              {link.name}

              {/* Garis Bawah Biru (Animasi) */}
              <span
                className={`absolute bottom-0 left-0 h-[2px] bg-blue-600 transition-all duration-300 ease-in-out ${
                  isActive ? 'w-full opacity-100' : 'w-0 opacity-0'
                }`}
              />
            </Link>
          );
        })}
      </div>

      {/* Tombol Login Desktop */}
      <div className="hidden md:block">
        <Link
          href="/login"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-all active:scale-95"
        >
          Login
        </Link>
      </div>

      {/* Tombol Hamburger Mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden text-gray-700 focus:outline-none p-1 rounded-md hover:bg-gray-100 transition-colors"
        aria-label="Toggle Menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Menu Mobile */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-lg py-4 px-6 flex flex-col space-y-3 md:hidden">
          {navLinks.map((link) => {
            const isActive = mounted && pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`px-3 py-2 rounded-lg font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-gray-100">
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="block text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}