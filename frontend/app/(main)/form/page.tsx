'use client';

import PageTransition from '../../components/PageTransition';

export default function FormLaporan() {
  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-56px)] bg-gradient-to-b from-white to-blue-200 py-12 px-4 sm:px-6 flex items-center justify-center">
        <div className="w-full max-w-xl bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100">
          
          {/* Header Form */}
          <div className="mb-6 border-b border-gray-100 pb-4">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Form Laporan</h1>
            <p className="text-sm text-gray-500 mt-1">
              Sampaikan kendala atau masalah fasilitas yang Anda temukan di lingkungan kampus.
            </p>
          </div>

          <form className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-gray-700">Deskripsi Laporan</label>
              <textarea
                rows={8}
                placeholder="Jelaskan masalah yang Anda temukan secara detail..."
                className="w-full border border-gray-300 bg-white text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none shadow-sm [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5 text-gray-700">Upload Foto (opsional)</label>
              <input
                type="file"
                accept="image/*"
                className="w-full border border-gray-300 bg-white text-gray-700 rounded-xl px-3 py-2 text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer shadow-sm"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 font-medium transition-all shadow-md active:scale-[0.99]"
              >
                Kirim Laporan
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageTransition>
  );
}