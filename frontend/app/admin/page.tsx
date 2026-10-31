'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

interface SummaryItem {
  id: number;
  summary: string;
  category: string;
  count: number;
  status: string;
  created_at: string;
}

interface TableReport {
  id: number;
  judul: string;
  pelapor: string;
  status: string;
  tanggal: string;
}

// Pemetaan Status Enum ke Label Bahasa Indonesia
const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: 'Menunggu',
  IN_PROGRESS: 'Diproses',
  RESOLVED: 'Selesai',
};

const getStatusLabel = (status: string): string => {
  return STATUS_LABELS[status] || status;
};

export default function AdminDashboard() {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const [reports, setReports] = useState<TableReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // 1. Fetch Data dari Backend API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch('https://facyport-backend-nine.vercel.app/api/summaries');
        if (!res.ok) throw new Error(`Gagal mengambil data (${res.status})`);
        
        const data: SummaryItem[] = await res.json();
        
        // Mapping data backend ke format tabel dashboard
        const mapped: TableReport[] = data.map((item) => ({
          id: item.id,
          judul: item.summary || '(Belum ada ringkasan)',
          pelapor: `${item.count} Pelapor`,
          status: item.status,
          tanggal: item.created_at ? item.created_at.split(' ')[0] : '-',
        }));

        setReports(mapped);
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : 'Terjadi kesalahan.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // 2. Kalkulasi Statistik Dinamis
  const stats = useMemo(() => {
    const total = reports.length;
    const inProgress = reports.filter(
      (r) => r.status === 'IN_PROGRESS' || r.status === 'Diproses'
    ).length;
    const resolved = reports.filter(
      (r) => r.status === 'RESOLVED' || r.status === 'Selesai'
    ).length;

    return { total, inProgress, resolved };
  }, [reports]);

  // 3. Logika Pagination Dinamis
  const totalPages = Math.ceil(reports.length / rowsPerPage) || 1;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = reports.slice(indexOfFirstRow, indexOfLastRow);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="min-h-[calc(100vh-56px)] bg-gradient-to-b from-white to-blue-200 py-16 px-6 sm:px-8 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
    >
      <div className="max-w-6xl mx-auto text-black">

        {/* Header Dashboard */}
        <div className="mb-10 mt-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
            Dashboard Admin
          </h1>
          <p className="text-base text-gray-600 mt-2">
            Kelola dan pantau seluruh laporan fasilitas kampus secara real-time.
          </p>
        </div>

        {/* State Error Notification */}
        {fetchError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 mb-8 text-sm">
            ⚠️ {fetchError}
          </div>
        )}

        {/* Kartu Statistik Dinamis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">Total Klaster Isu</p>
            <p className="text-4xl font-extrabold mt-3 text-blue-600">
              {loading ? '...' : stats.total}
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">Sedang Diproses</p>
            <p className="text-4xl font-extrabold mt-3 text-yellow-600">
              {loading ? '...' : stats.inProgress}
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">Selesai</p>
            <p className="text-4xl font-extrabold mt-3 text-green-600">
              {loading ? '...' : stats.resolved}
            </p>
          </div>
        </div>

        {/* Tabel Laporan Terbaru dengan Pagination Dinamis */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Laporan Terbaru</h2>
            <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
              5 Data per Halaman
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold">No</th>
                  <th className="px-6 py-4 font-semibold">Judul Kendala</th>
                  <th className="px-6 py-4 font-semibold">Jumlah Pelapor</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400 animate-pulse">
                      Memuat data dashboard...
                    </td>
                  </tr>
                ) : currentRows.length > 0 ? (
                  currentRows.map((item, index) => {
                    const statusLabel = getStatusLabel(item.status);
                    return (
                      <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-500">
                          {indexOfFirstRow + index + 1}
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900">{item.judul}</td>
                        <td className="px-6 py-4 text-gray-600">{item.pelapor}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                              statusLabel === 'Selesai'
                                ? 'bg-green-100 text-green-700'
                                : statusLabel === 'Diproses'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{item.tanggal}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                      Belum ada data laporan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Bagian Kontrol Pagination Dinamis */}
          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Menampilkan halaman <span className="font-semibold text-gray-800">{currentPage}</span> dari{' '}
              <span className="font-semibold text-gray-800">{totalPages}</span>
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || loading}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  currentPage === 1 || loading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 shadow-sm'
                }`}
              >
                Sebelumnya
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || loading}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  currentPage === totalPages || loading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 shadow-sm'
                }`}
              >
                Selanjutnya
              </button>
            </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
}