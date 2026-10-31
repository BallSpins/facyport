'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../../components/PageTransition';

export default function ReportListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;

  // State untuk menyimpan daftar report (ditambahkan field jumlahPelapor)
  const [reports, setReports] = useState([
    { id: '1', judul: 'AC Rusak di Gedung A', pelapor: 'Budi', jumlahPelapor: 5, status: 'Diproses', tanggal: '2026-10-30' },
    { id: '2', judul: 'Lampu Mati di Koridor B', pelapor: 'Siti', jumlahPelapor: 2, status: 'Selesai', tanggal: '2026-10-28' },
    { id: '3', judul: 'Kebocoran Atap Lab C', pelapor: 'Andi', jumlahPelapor: 12, status: 'Menunggu', tanggal: '2026-10-31' },
    { id: '4', judul: 'Pintu Toilet Gedung B Macet', pelapor: 'Dewi', jumlahPelapor: 3, status: 'Selesai', tanggal: '2026-10-29' },
    { id: '5', judul: 'Kabel LAN Putus di Perpus', pelapor: 'Rizky', jumlahPelapor: 8, status: 'Diproses', tanggal: '2026-10-28' },
    { id: '6', judul: 'Kursi Kuliah patah di R.302', pelapor: 'Eko', jumlahPelapor: 1, status: 'Selesai', tanggal: '2026-10-28' },
    { id: '7', judul: 'Kran Air Toilet Gedung A Rusak', pelapor: 'Fitri', jumlahPelapor: 4, status: 'Menunggu', tanggal: '2026-10-27' },
    { id: '8', judul: 'Stop Kontak Longgar di Aula', pelapor: 'Guntur', jumlahPelapor: 6, status: 'Selesai', tanggal: '2026-10-26' },
    { id: '9', judul: 'Proyektor Redup di Ruang Sidang', pelapor: 'Hendra', jumlahPelapor: 15, status: 'Menunggu', tanggal: '2026-10-26' },
    { id: '10', judul: 'Plafon Bocor Hall Utama', pelapor: 'Joko', jumlahPelapor: 9, status: 'Diproses', tanggal: '2026-10-26' },
  ]);

  // State untuk Modal Konfirmasi Status
  const [selectedReport, setSelectedReport] = useState<{ id: string; judul: string; status: string } | null>(null);

  // Logika Filter & Pencarian
  const filteredReports = useMemo(() => {
    let result = reports.filter((r) => {
      const matchesSearch =
        r.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.pelapor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase());

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
    if (currentStatus === 'Menunggu') return 'Diproses';
    if (currentStatus === 'Diproses') return 'Selesai';
    return null;
  };

  const handleConfirmStatusChange = () => {
    if (!selectedReport) return;
    const nextStatus = getNextStatus(selectedReport.status);
    if (!nextStatus) return;

    setReports((prev) =>
      prev.map((item) => (item.id === selectedReport.id ? { ...item, status: nextStatus } : item))
    );
    setSelectedReport(null);
  };

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-56px)] bg-gradient-to-b from-white to-blue-200 py-12 px-6 sm:px-10 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-8 text-black tracking-tight">Daftar Laporan</h1>

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
              {['Semua', 'Menunggu', 'Diproses', 'Selesai', 'Paling Ramai'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusFilterChange(status)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    statusFilter === status
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'Paling Ramai' ? ' Paling Ramai' : status}
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
                          <td className="px-6 py-4 text-sm font-semibold">{r.judul}</td>
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
                              title={nextStatus ? `Ubah status ke ${nextStatus}` : 'Status sudah Selesai (Tidak dapat diubah)'}
                              className={`px-3 py-1 rounded-md w-full text-xs font-semibold inline-flex items-center space-x-1 transition-all ${
                                r.status === 'Selesai'
                                  ? 'bg-green-200 text-green-600 cursor-default'
                                  : r.status === 'Diproses'
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
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 shadow-sm'
                  }`}
                >
                  Sebelumnya
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    currentPage === totalPages
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
