import Link from 'next/link';

export const instant = false;

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div>
      <Link href="/admin/report" className="text-blue-600 hover:underline text-sm mb-4 inline-block">
        ← Kembali ke Daftar Report
      </Link>
      <h1 className="text-3xl font-bold mb-6">Detail Report #{id}</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
        <div>
          <p className="text-sm text-gray-500">Judul</p>
          <p className="font-medium">AC Rusak di Gedung A</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Pelapor</p>
          <p className="font-medium">Budi</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Kategori</p>
          <p className="font-medium">Fasilitas</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Status</p>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            Diproses
          </span>
        </div>
        <div>
          <p className="text-sm text-gray-500">Deskripsi</p>
          <p className="text-gray-700 dark:text-gray-300">
            AC di ruangan 201 Gedung A tidak berfungsi sejak 3 hari yang lalu.
            Sudah dicoba restart tetapi tetap tidak dingin.
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Tanggal Laporan</p>
          <p className="font-medium">2026-10-30</p>
        </div>
      </div>
    </div>
  );
}

