'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const laporanMingguan = [
    { id: 1, judul: 'Kerusakan Proyektor Lab RPL', pelapor: 'Ahmad Fauzi', status: 'Diproses', tanggal: '2026-10-31' },
    { id: 2, judul: 'AC Bocor Ruang Dosen Lt. 2', pelapor: 'Siti Aminah', status: 'Selesai', tanggal: '2026-10-30' },
    { id: 3, judul: 'Kabel LAN Putus di Perpus', pelapor: 'Budi Santoso', status: 'Menunggu', tanggal: '2026-10-30' },
    { id: 4, judul: 'Pintu Toilet Gedung B Macet', pelapor: 'Dewi Lestari', status: 'Selesai', tanggal: '2026-10-29' },
    { id: 5, judul: 'Lampu Koridor Utama Padam', pelapor: 'Rizky Pratama', status: 'Diproses', tanggal: '2026-10-28' },
    { id: 6, judul: 'Kursi Kuliah patah di R.302', pelapor: 'Eko Prasetyo', status: 'Selesai', tanggal: '2026-10-28' },
    { id: 7, judul: 'Kran Air Toilet Gedung A Rusak', pelapor: 'Fitri Handayani', status: 'Menunggu', tanggal: '2026-10-27' },
    { id: 8, judul: 'Stop Kontak Longgar di Aula', pelapor: 'Guntur Wicaksono', status: 'Selesai', tanggal: '2026-10-26' },
    { id: 9, judul: 'Plafon Rembes Air Hujan', pelapor: 'Hesti Widowati', status: 'Diproses', tanggal: '2026-10-26' },
    { id: 10, judul: 'Papan Tulis Spidol Habis', pelapor: 'Irfan Hakim', status: 'Selesai', tanggal: '2026-10-25' },
  ];

  // Logika Pagination
  const totalPages = Math.ceil(laporanMingguan.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = laporanMingguan.slice(indexOfFirstRow, indexOfLastRow);

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

        {/* Kartu Statistik */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">Total Laporan</p>
            <p className="text-4xl font-extrabold mt-3 text-blue-600">24</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">Sedang Diproses</p>
            <p className="text-4xl font-extrabold mt-3 text-yellow-600">8</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">Selesai</p>
            <p className="text-4xl font-extrabold mt-3 text-green-600">16</p>
          </div>
        </div>

        {/* Tabel Laporan Mingguan dengan Pagination (5 Row per Halaman) */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Laporan Mingguan Terbaru</h2>
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
                  <th className="px-6 py-4 font-semibold">Pelapor</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-800">
                {currentRows.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-500">
                      {indexOfFirstRow + index + 1}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{item.judul}</td>
                    <td className="px-6 py-4 text-gray-600">{item.pelapor}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                          item.status === 'Selesai'
                            ? 'bg-green-100 text-green-700'
                            : item.status === 'Diproses'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{item.tanggal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bagian Kontrol Pagination */}
          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Menampilkan halaman <span className="font-semibold text-gray-800">{currentPage}</span> dari <span className="font-semibold text-gray-800">{totalPages}</span>
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
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
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
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
    </motion.div>
  );
}