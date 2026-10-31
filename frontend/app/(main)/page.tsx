import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 px-4">
      <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
        Selamat Datang di <span className="text-blue-600">FacyPort</span>
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-xl text-center">
        Platform pelaporan fasilitas kampus yang cepat, mudah, dan transparan.
      </p>
      <div className="flex space-x-4">
        <Link
          href="/form"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Buat Laporan
        </Link>
        <Link
          href="/informasi"
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 font-medium"
        >
          Lihat Informasi
        </Link>
      </div>
    </div>
  );
}

