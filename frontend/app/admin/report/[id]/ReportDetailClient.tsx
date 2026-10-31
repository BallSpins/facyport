'use client';

import Link from 'next/link';
import { useState, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../../../components/PageTransition';

export default function ReportDetailClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Data dummy 10 foto pelapor
  const allPhotos = Array.from({ length: 10 }, (_, index) => ({
    id: index + 1,
    title: `Foto Dokumentasi #${index + 1}`,
  }));

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-56px)] bg-gradient-to-b from-white to-blue-200 py-12 px-6 sm:px-10 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="max-w-4xl mx-auto pb-12">
          
          {/* Tombol Kembali */}
          <Link 
            href="/admin/report" 
            className="inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-800 mb-6 transition-colors"
          >
            ← Kembali ke Daftar Laporan
          </Link>

          {/* Judul Halaman */}
          <h1 className="text-4xl font-extrabold mb-8 text-black tracking-tight">
            Detail Laporan #{id}
          </h1>

          {/* Kartu Konten Detail */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6 text-black">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Judul Laporan</p>
                <p className="text-lg font-bold text-gray-900">AC Rusak di Gedung A</p>
              </div>
              
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Kategori</p>
                <p className="text-base font-semibold text-gray-800">Fasilitas</p>
              </div>
            </div>

            {/* Informasi Jumlah Pelapor Serupa */}
            <div className="border-t border-gray-100 pt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Jumlah Pelapor Kendala Serupa</p>
              <span className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-xl font-bold text-xs border border-orange-200 inline-flex items-center gap-1.5 shadow-sm">
                👥 5 Orang Melaporkan Masalah Ini
              </span>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Status Saat Ini</p>
              <span className="px-3 py-1 rounded-full text-xs font-semibold inline-block bg-yellow-100 text-yellow-700 shadow-sm">
                Diproses
              </span>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Deskripsi Kendala</p>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-700 leading-relaxed">
                  AC di ruangan 201 Gedung A tidak berfungsi sejak 3 hari yang lalu. Sudah dicoba restart tetapi tetap tidak dingin.
                </p>
              </div>
            </div>

            {/* Tempat Media Foto-foto Pelapor */}
            <div className="border-t border-gray-100 pt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Dokumentasi / Foto Bukti Pelapor</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {/* Foto Dummy 1 */}
                <div className="relative group bg-gray-100 rounded-xl overflow-hidden border border-gray-200 aspect-video flex items-center justify-center">
                  <span className="text-xs text-gray-500 font-medium">Foto Unit AC 1</span>
                </div>
                {/* Foto Dummy 2 */}
                <div className="relative group bg-gray-100 rounded-xl overflow-hidden border border-gray-200 aspect-video flex items-center justify-center">
                  <span className="text-xs text-gray-500 font-medium">Foto Indikator 2</span>
                </div>
                {/* Tombol Lihat Foto Lainnya */}
                <button
                  onClick={() => setShowPhotoModal(true)}
                  className="relative group bg-blue-50 hover:bg-blue-100 rounded-xl overflow-hidden border border-blue-200 aspect-video flex flex-col items-center justify-center transition-all cursor-pointer shadow-sm"
                >
                  <span className="text-xs font-bold text-blue-600 mb-1">📷 Lihat Lainnya</span>
                  <span className="text-[10px] text-blue-500 font-medium">+8 Foto Lainnya</span>
                </button>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Tanggal Laporan</p>
              <p className="text-sm font-semibold text-gray-800">2026-10-30</p>
            </div>

          </div>
        </div>
      </div>

      {/* MODAL GALERI FOTO PELAPOR */}
      <AnimatePresence>
        {showPhotoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setShowPhotoModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col p-6 text-black border border-gray-100"
            >
              {/* Header Modal */}
              <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4">
                <div>
                  <h3 className="text-xl font-bold">Galeri Foto Pelapor</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Menampilkan seluruh dokumentasi (10 Foto)</p>
                </div>
              </div>

              {/* Grid Foto yang bisa di-scroll (4 Kolom per row) */}
              <div className="overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-4 gap-4 max-h-[60vh] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                {allPhotos.map((photo) => (
                  <div 
                    key={photo.id}
                    className="bg-gray-50 border border-gray-200 rounded-xl aspect-video flex flex-col items-center justify-center p-3 shadow-sm hover:shadow transition-all group"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2 font-bold text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      📷
                    </div>
                    <span className="text-xs font-semibold text-gray-700 text-center">{photo.title}</span>
                  </div>
                ))}
              </div>

              {/* Footer Modal */}
              <div className="pt-4 border-t border-gray-100 mt-4 flex justify-end">
                <button
                  onClick={() => setShowPhotoModal(false)}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md transition-all"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}

