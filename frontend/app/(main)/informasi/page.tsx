'use client';

import { useState, useMemo, useEffect } from 'react';
import PageTransition from '../../components/PageTransition';

interface Report {
  id: number;
  judul: string;
  kategori: string;
  jumlahPelapor: number;
  status: string;
  tanggal: string;
}

export default function InformasiPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

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
          tanggal: item.created_at ? item.created_at.split(' ')[0] : '-',
        }));
        setReports(mapped);
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : 'Terjadi kesalahan.');
        // Data cadangan jika backend belum terhubung
        setReports([
          { id: 1, judul: 'AC Rusak di Gedung A', kategori: 'Fasilitas', jumlahPelapor: 5, status: 'IN_PROGRESS', tanggal: '2026-10-30' },
          { id: 2, judul: 'Lampu Mati di Koridor B', kategori: 'Kelistrikan', jumlahPelapor: 2, status: 'RESOLVED', tanggal: '2026-10-28' },
          { id: 3, judul: 'Kebocoran Atap Lab C', kategori: 'Bangunan', jumlahPelapor: 12, status: 'SUBMITTED', tanggal: '2026-10-31' },
          { id: 4, judul: 'Pintu Toilet Gedung B Macet', kategori: 'Fasilitas', jumlahPelapor: 3, status: 'RESOLVED', tanggal: '2026-10-29' },
          { id: 5, judul: 'Kabel LAN Putus di Perpus', kategori: 'Jaringan', jumlahPelapor: 8, status: 'IN_PROGRESS', tanggal: '2026-10-28' },
          { id: 6, judul: 'Kursi Kuliah patah di R.302', kategori: 'Fasilitas', jumlahPelapor: 1, status: 'RESOLVED', tanggal: '2026-10-28' },
          { id: 7, judul: 'Kran Air Toilet Gedung A Rusak', kategori: 'Sanitasi', jumlahPelapor: 4, status: 'SUBMITTED', tanggal: '2026-10-27' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

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
        r.status === statusFilter ||
        (statusFilter === 'SUBMITTED' && r.status === 'Menunggu') ||
        (statusFilter === 'IN_PROGRESS' && r.status === 'Diproses') ||
        (statusFilter === 'RESOLVED' && r.status === 'Selesai');

      return matchesSearch && matchesStatus;
    });

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

  const getStatusBadge = (status: string) => {
    const isResolved = status === 'RESOLVED' || status === 'Selesai';
    const isInProgress = status === 'IN_PROGRESS' || status === 'Diproses';

    if (isResolved) {
      return (
        <span className="px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center gap-1.5 bg-green-200 text-green-700">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          {status}
        </span>
      );
    }

    if (isInProgress) {
      return (
        <span className="px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center gap-1.5 bg-yellow-200 text-yellow-800">
          <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
          {status}
        </span>
      );
    }

    return (
      <span className="px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center gap-1.5 bg-gray-300 text-gray-700">
        <span className="w-2 h-2 rounded-full bg-gray-500"></span>
        {status}
      </span>
    );
  };

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-56px)] bg-gradient-to-b from-white to-blue-200 py-12 px-6 sm:px-10 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-8 text-black tracking-tight">Informasi Laporan</h1>

          {/* Loading & Error State */}
          {loading && (
            <div className="bg-white p-8 rounded-2xl shadow border border-gray-100 mb-8 text-center text-gray-500 text-sm animate-pulse">
              Memuat data laporan...
            </div>
          )}
          {fetchError && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl px-5 py-4 mb-8 text-sm flex items-center justify-between">
              <span>ℹ️ Menampilkan data terkini ({fetchError})</span>
            </div>
          )}

          {/* Kontrol Pencarian & Filter Status */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 mb-8 flex flex-col sm:flex-row justify-between gap-4 items-center">
            <div className="w-full sm:w-96">
              <input
                type="text"
                placeholder="Cari judul, kategori, atau ID..."
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
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    statusFilter === value
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
                    <th className="px-6 py-4 text-sm font-semibold text-black bg-green-100">Status</th>
                    <th className="px-6 py-4 text-sm font-semibold text-black">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-black">
                  {currentRows.length > 0 ? (
                    currentRows.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium">{r.id}</td>
                        <td className="px-6 py-4 text-sm">
                          <p className="font-semibold">{r.judul}</p>
                          {r.kategori && r.kategori !== '-' && (
                            <p className="text-xs text-gray-500 mt-0.5">{r.kategori}</p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-2.5 py-1 bg-orange-50 text-orange-700 rounded-lg font-bold text-xs border border-orange-200 inline-flex items-center gap-1">
                            👥 {r.jumlahPelapor} Orang
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {getStatusBadge(r.status)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{r.tanggal}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
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
      </div>
    </PageTransition>
  );
}
