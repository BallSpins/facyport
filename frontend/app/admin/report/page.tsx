'use client';

import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../../components/PageTransition';

interface Report {
  id: number;
  judul: string;
  kategori: string;
  jumlahPelapor: number;
  status: string;
  tanggal: string;
}

export default function ReportListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch('https://facyport-backend-nine.vercel.app/api/summaries');
        if (!res.ok) throw new Error(`Gagal mengambil data (${res.status})`);
        const data = await res.json();
        const mapped: Report[] = data.map((item: {
          id: number;
          summary: string;
          category: string;
          count: number;
          status: string;
          created_at: string;
        }) => ({
          id: item.id,
          judul: item.summary || '(Belum ada ringkasan)',
          kategori: item.category || '-',
          jumlahPelapor: item.count,
          status: item.status,
          tanggal: item.created_at.split(' ')[0],
        }));
        setReports(mapped);
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : 'Terjadi kesalahan.');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // State untuk Modal Konfirmasi Status
  const [selectedReport, setSelectedReport] = useState<{ id: number; judul: string; status: string } | null>(null);

  // Logika Filter & Pencarian
  const filteredReports = useMemo(() => {
    let result = reports.filter((r) => {
      const matchesSearch =
        r.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.kategori.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.toString().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'Semua' ||
        statusFilter === 'Paling Ramai' ||
        r.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Jika filter "Paling Ramai" dipilih, urutkan berdasarkan jumlah pelapor terbanyak (descending)
    if (statusFilter === 'Paling Ramai') {
      result = [...result].sort((a, b) => b.jumlahPelapor - a.jumlahPelapor);
    }

    return result;
  }, [searchQuery, statusFilter, reports]);

  // Logika Pagination
  const totalPages = Math.ceil(filteredReports.length / rowsPerPage) || 1;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredReports.slice(indexOfFirstRow, indexOfLastRow);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const getNextStatus = (currentStatus: string) => {
    if (currentStatus === 'SUBMITTED') return 'IN_PROGRESS';
    if (currentStatus === 'IN_PROGRESS') return 'RESOLVED';
    return null;
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedReport) return;
    const nextStatus = getNextStatus(selectedReport.status);
    if (!nextStatus) return;

    const adminToken = process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY;

    setUpdatingStatus(true);
    try {
      const response = await fetch(
        `https://facyport-backend-nine.vercel.app/api/summaries/${selectedReport.id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            status: nextStatus,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Gagal memperbarui status (${response.status})`);
      }

      const updatedSummary = await response.json();

      setReports((prev) =>
        prev.map((item) =>
          item.id === selectedReport.id ? { ...item, status: updatedSummary.status } : item
        )
      );

      setSelectedReport(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengubah status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-56px)] bg-gradient-to-b from-white to-blue-200 py-12 px-6 sm:px-10 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-8 text-black tracking-tight">Daftar Laporan</h1>

          {/* Loading & Error State */}
          {loading && (
            <div className="bg-white p-8 rounded-2xl shadow border border-gray-100 mb-8 text-center text-gray-500 text-sm animate-pulse">
              Memuat data laporan...
            </div>
          )}
          {fetchError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 mb-8 text-sm">
              ⚠️ {fetchError}
            </div>
          )}

          {/* Kontrol Pencarian & Filter Status */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 mb-8 flex flex-col sm:flex-row justify-between gap-4 items-center">
            <div className="w-full sm:w-96">
              <input
                type="text"
                placeholder="Cari judul, pelapor, atau ID..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-black shadow-sm"
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {[
                { value: 'Semua', label: 'Semua' },
                { value: 'SUBMITTED', label: 'Submitted' },
                { value: 'IN_PROGRESS', label: 'In Progress' },
                { value: 'RESOLVED', label: 'Resolved' },
                { value: 'Paling Ramai', label: '🔥 Paling Ramai' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => handleStatusFilterChange(value)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${statusFilter === value
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Tabel Data */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-black">ID</th>
                    <th className="px-6 py-4 text-sm font-semibold text-black bg-red-200">Laporan</th>
                    <th className="px-6 py-4 text-sm font-semibold text-black bg-orange-100">Jumlah Pelapor</th>
                    <th className="px-6 py-4 text-sm font-semibold text-black bg-green-100">Status (Klik untuk Ubah)</th>
                    <th className="px-6 py-4 text-sm font-semibold text-black">Tanggal</th>
                    <th className="px-6 py-4 text-sm font-semibold text-black bg-blue-300">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-black">
                  {currentRows.length > 0 ? (
                    currentRows.map((r) => {
                      const nextStatus = getNextStatus(r.status);
                      return (
                        <tr key={r.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium">{r.id}</td>
                          <td className="px-6 py-4 text-sm">
                            <p className="font-semibold">{r.judul}</p>
                            {r.kategori && r.kategori !== '-' && (
                              <p className="text-xs text-gray-400 mt-0.5">{r.kategori}</p>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className="px-2.5 py-1 bg-orange-50 text-orange-700 rounded-lg font-bold text-xs border border-orange-200 inline-flex items-center gap-1">
                              👥 {r.jumlahPelapor} Orang
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => {
                                if (nextStatus) {
                                  setSelectedReport({ id: r.id, judul: r.judul, status: r.status });
                                }
                              }}
                              title={nextStatus ? `Ubah status ke ${nextStatus}` : 'Status sudah RESOLVED (Tidak dapat diubah)'}
                              className={`px-3 py-1 rounded-md w-full text-xs font-semibold inline-flex items-center space-x-1 transition-all ${r.status === 'RESOLVED'
                                  ? 'bg-green-200 text-green-600 cursor-default'
                                  : r.status === 'IN_PROGRESS'
                                    ? 'bg-yellow-200 text-yellow-700 hover:bg-yellow-200 cursor-pointer shadow-sm'
                                    : 'bg-gray-400 text-gray-100 hover:bg-gray-300 cursor-pointer shadow-sm'
                                }`}
                            >
                              <span>{r.status}</span>
                              {nextStatus && <span className="text-[10px] opacity-70 ml-1">➔ {nextStatus}</span>}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400">{r.tanggal}</td>
                          <td className="px-6 py-4 text-sm">
                            <Link href={`/admin/report/${r.id}`} className="text-blue-600 hover:underline font-bold">
                              Detail
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                        Tidak ada laporan yang ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">
                Menampilkan halaman <span className="font-bold text-gray-800">{currentPage}</span> dari <span className="font-bold text-gray-800">{totalPages}</span>
              </span>
              <div className="flex space-x-3">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 shadow-sm'
                    }`}
                >
                  Sebelumnya
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${currentPage === totalPages
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

        {/* MODAL KONFIRMASI PERUBAHAN STATUS DENGAN ANIMASI FRAMER MOTION */}
        <AnimatePresence>
          {selectedReport && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedReport(null)}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-black border border-gray-100"
              >
                <h3 className="text-xl font-bold mb-2">Konfirmasi Perubahan Status</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Apakah Anda yakin ingin mengubah status laporan <span className="font-semibold text-gray-900">&quot;{selectedReport.judul}&quot;</span> dari{' '}
                  <span className="font-semibold text-blue-600">{selectedReport.status}</span> ke{' '}
                  <span className="font-semibold text-green-600">{getNextStatus(selectedReport.status)}</span>?
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-6 text-xs text-yellow-800">
                  ⚠️ Perhatian: Status yang sudah ditingkatkan tidak dapat diturunkan kembali ke tahap sebelumnya.
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                  >
                    Tidak
                  </button>
                  <button
                    onClick={handleConfirmStatusChange}
                    className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md transition-all"
                  >
                    Ya, Lanjutkan
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
