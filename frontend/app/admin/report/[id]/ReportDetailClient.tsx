'use client';

import Link from 'next/link';
import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../../../components/PageTransition';
import { getStatusLabel } from '@/lib/status';

interface ReportDetail {
  id: number;
  summary: string;
  category: string;
  keywords: string[];
  status: string;
  count: number;
  created_at: string;
}

export default function ReportDetailClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [report, setReport] = useState<ReportDetail | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // State Modal
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // 1. Fetch detail ringkasan/klaster
        const resSummary = await fetch(`https://facyport-backend-nine.vercel.app/api/summaries/${id}`);
        if (!resSummary.ok) throw new Error(`Laporan tidak ditemukan (${resSummary.status})`);
        const summaryData: ReportDetail = await resSummary.json();
        setReport(summaryData);

        // 2. Fetch seluruh aduan untuk ekstrak foto bukti
        try {
          const resReports = await fetch(`https://facyport-backend-nine.vercel.app/api/summaries/${id}/reports`);
          if (resReports.ok) {
            const reportsData: Array<{ img_url?: string }> = await resReports.json();
            const extractedImages = reportsData
              .map((r) => r.img_url)
              .filter((url): url is string => Boolean(url));

            setImages(extractedImages);
          }
        } catch (err) {
          console.error('Gagal mengambil daftar foto aduan:', err);
        }

      } catch (err) {
        setFetchError(err instanceof Error ? err.message : 'Terjadi kesalahan.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [id]);

  const statusColor = (status: string) => {
    if (status === 'RESOLVED') return 'bg-green-100 text-green-700';
    if (status === 'IN_PROGRESS') return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-200 text-gray-600';
  };

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

          <h1 className="text-4xl font-extrabold mb-8 text-black tracking-tight">
            Detail Laporan #{id}
          </h1>

          {/* Loading */}
          {loading && (
            <div className="bg-white rounded-2xl shadow border border-gray-100 p-10 text-center text-gray-500 text-sm animate-pulse">
              Memuat detail laporan dan dokumentasi...
            </div>
          )}

          {/* Error */}
          {fetchError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 text-sm">
              ⚠️ {fetchError}
            </div>
          )}

          {/* Content */}
          {report && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6 text-black">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Ringkasan Laporan</p>
                  <p className="text-lg font-bold text-gray-900">
                    {report.summary || '(Belum ada ringkasan)'}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Kategori</p>
                  <p className="text-base font-semibold text-gray-800">
                    {report.category || '-'}
                  </p>
                </div>
              </div>

              {/* Keywords */}
              {report.keywords && report.keywords.length > 0 && (
                <div className="border-t border-gray-100 pt-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Kata Kunci</p>
                  <div className="flex flex-wrap gap-2">
                    {report.keywords.map((kw) => (
                      <span
                        key={kw}
                        className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold border border-blue-100"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Jumlah Pelapor */}
              <div className="border-t border-gray-100 pt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Jumlah Pelapor Kendala Serupa</p>
                <span className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-xl font-bold text-xs border border-orange-200 inline-flex items-center gap-1.5 shadow-sm">
                  👥 {report.count} Orang Melaporkan Masalah Ini
                </span>
              </div>

              {/* Status */}
              <div className="border-t border-gray-100 pt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Status Saat Ini</p>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block shadow-sm ${statusColor(report.status)}`}>
                  {getStatusLabel(report.status)}
                </span>
              </div>

              {/* Tanggal */}
              <div className="border-t border-gray-100 pt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Tanggal Laporan</p>
                <p className="text-sm font-semibold text-gray-800">{report.created_at.split(' ')[0]}</p>
              </div>

              {/* Tempat Media Foto-foto Pelapor */}
              <div className="border-t border-gray-100 pt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                  Dokumentasi / Foto Bukti Pelapor ({images.length} Foto)
                </p>

                {images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {/* Jika jumlah foto > 3: Tampilkan 2 foto pertama + 1 tombol 'Lihat Lainnya' */}
                    {images.length > 3 ? (
                      <>
                        {images.slice(0, 2).map((imgUrl, idx) => (
                          <div
                            key={idx}
                            onClick={() => setSelectedPhotoUrl(imgUrl)}
                            className="relative group bg-gray-100 rounded-xl overflow-hidden border border-gray-200 aspect-video cursor-pointer shadow-sm hover:shadow-md transition-all"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imgUrl}
                              alt={`Foto Bukti #${idx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                              Perbesar
                            </div>
                          </div>
                        ))}

                        {/* Tombol Lihat Foto Lainnya */}
                        <button
                          onClick={() => setShowPhotoModal(true)}
                          className="relative group bg-blue-50 hover:bg-blue-100 rounded-xl overflow-hidden border border-blue-200 aspect-video flex flex-col items-center justify-center transition-all cursor-pointer shadow-sm"
                        >
                          <span className="text-xs font-bold text-blue-600 mb-1">Lihat Lainnya</span>
                          <span className="text-[10px] text-blue-500 font-medium">+{images.length - 2} Foto Lainnya</span>
                        </button>
                      </>
                    ) : (
                      /* Jika jumlah foto <= 3: Tampilkan seluruh foto langsung */
                      images.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedPhotoUrl(imgUrl)}
                          className="relative group bg-gray-100 rounded-xl overflow-hidden border border-gray-200 aspect-video cursor-pointer shadow-sm hover:shadow-md transition-all"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imgUrl}
                            alt={`Foto Bukti #${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                            Perbesar
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-6 text-center text-xs text-gray-400 font-medium">
                    📷 Tidak ada dokumentasi foto yang dilampirkan pada laporan ini.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: GALERI SELURUH FOTO (+N LAINNYA) */}
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
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 text-black border border-gray-100"
            >
              <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4">
                <div>
                  <h3 className="text-xl font-bold">Galeri Foto Pelapor</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Menampilkan seluruh dokumentasi ({images.length} Foto)</p>
                </div>
                <button
                  onClick={() => setShowPhotoModal(false)}
                  className="text-gray-400 hover:text-gray-600 font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Grid Seluruh Foto */}
              <div className="overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[60vh] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                {images.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedPhotoUrl(imgUrl)}
                    className="relative group bg-gray-100 rounded-xl overflow-hidden border border-gray-200 aspect-video cursor-pointer shadow-sm hover:shadow-md transition-all"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgUrl}
                      alt={`Galeri Bukti #${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                      Perbesar
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-100 mt-4 flex justify-end">
                <button
                  onClick={() => setShowPhotoModal(false)}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md transition-all"
                >
                  Tutup Galeri
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 2: PRATINJAU HIGH-RES PER-FOTO */}
      <AnimatePresence>
        {selectedPhotoUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSelectedPhotoUrl(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 text-black border border-gray-100 overflow-hidden"
            >
              <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4">
                <div>
                  <h3 className="text-xl font-bold">Detail Dokumentasi Foto</h3>
                </div>
                <button
                  onClick={() => setSelectedPhotoUrl(null)}
                  className="text-gray-400 hover:text-gray-600 font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="relative w-full max-h-[65vh] flex items-center justify-center bg-gray-900 rounded-xl overflow-hidden p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedPhotoUrl}
                  alt="Bukti Laporan High Res"
                  className="max-h-[60vh] w-auto object-contain rounded-lg"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 mt-4 flex justify-end">
                <button
                  onClick={() => setSelectedPhotoUrl(null)}
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