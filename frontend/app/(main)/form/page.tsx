'use client';

import { useState, useRef } from 'react';
import PageTransition from '../../components/PageTransition';

type AlertType = 'success' | 'error' | null;

interface ApiResponse {
  status: string;
  message: string;
  message_id?: string;
}

export default function FormLaporan() {
  const [alert, setAlert] = useState<{ type: AlertType; data: ApiResponse | null }>({ type: null, data: null });
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ type: null, data: null });

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch('https://facyport-backend-nine.vercel.app/api/reports', {
        method: 'POST',
        body: formData,
      });

      const data: ApiResponse = await res.json();

      if (res.ok) {
        setAlert({ type: 'success', data });
        formRef.current?.reset();
      } else {
        setAlert({ type: 'error', data });
      }
    } catch {
      setAlert({
        type: 'error',
        data: { status: 'error', message: 'Gagal terhubung ke server. Coba lagi.' },
      });
    } finally {
      setLoading(false);
    }
  };

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

          {/* Alert */}
          {alert.type && alert.data && (
            <div
              className={`mb-5 rounded-xl px-4 py-3.5 text-sm border ${
                alert.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              <p className="font-semibold capitalize">{alert.data.status}</p>
              <p className="mt-0.5">{alert.data.message}</p>
              {alert.data.message_id && (
                <p className="mt-1 text-xs opacity-70 font-mono break-all">
                  ID: {alert.data.message_id}
                </p>
              )}
            </div>
          )}

          <form ref={formRef} className="space-y-5" onSubmit={handleSubmit} encType="multipart/form-data">
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-gray-700">Deskripsi Laporan</label>
              <textarea
                name="raw_text"
                rows={8}
                required
                placeholder="Jelaskan masalah yang Anda temukan secara detail..."
                className="w-full border border-gray-300 bg-white text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none shadow-sm [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5 text-gray-700">Upload Foto (opsional)</label>
              <input
                type="file"
                name="image"
                accept="image/*"
                className="w-full border border-gray-300 bg-white text-gray-700 rounded-xl px-3 py-2 text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer shadow-sm"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 font-medium transition-all shadow-md active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Mengirim...' : 'Kirim Laporan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageTransition>
  );
}