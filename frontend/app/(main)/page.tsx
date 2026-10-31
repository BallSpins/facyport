import Link from 'next/link';
import PageTransition from '../components/PageTransition';
import Image from 'next/image'; // Opsional jika pakai Next.js Image, atau pakai tag <img> biasa

export default function HomePage() {
  return (
    <PageTransition>
    <div className="min-h-[calc(100vh-56px)] px-6 sm:px-12 md:px-24 grid grid-cols-1 lg:grid-cols-2 items-center justify-center bg-gradient-to-b from-white to-blue-200">

      {/* Kolom Kiri: Teks dan Tombol */}
      <div className="flex flex-col items-start justify-center py-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-4">
          Selamat Datang di <span className="text-blue-600">Facyport</span>
        </h1>
        <p className="text-base sm:text-lg text-black mb-8 max-w-xl text-left">
          Platform pelaporan fasilitas kampus yang cepat, mudah, dan transparan.
        </p>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <Link
            href="/form"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-center"
          >
            Buat Laporan
          </Link>
          <Link
            href="/informasi"
            className="px-6 py-3 rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-medium text-center"
          >
            Lihat Informasi
          </Link>
        </div>
      </div>

      {/* Kolom Kanan: Gambar (Hanya muncul di layar Desktop / lg ke atas) */}
      <div className="hidden lg:flex justify-center items-center p-6">
        <svg
          className="w-full max-w-2xl h-auto text-blue-600" /* Ubah text-blue-600 sesuai keinginan */
          fill="currentColor" /* Membuat elemen SVG mengikuti warna dari kelas teks */
          viewBox="0 0 24 24"
        >
          {/* Paste semua kode <path> yang ada di dalam file SVG kamu di sini */}
          <path d="M12 3L1 9l11 6 9-4.917V17h2V9L12 3z..." />
        </svg>
      </div>

    </div>
    </PageTransition>
  );
}