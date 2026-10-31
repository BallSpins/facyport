'use client';

import PageTransition from '../../components/PageTransition';

export default function InformasiPage() {
  const laporanDummy = [
    { id: 1, judul: 'AC Rusak di Gedung A', status: 'Diproses', tanggal: '2026-10-30' },
    { id: 2, judul: 'Lampu Mati di Koridor B', status: 'Selesai', tanggal: '2026-10-28' },
    { id: 3, judul: 'Kebocoran Atap Lab C', status: 'Menunggu', tanggal: '2026-10-31' },
  ];

  return (
  <PageTransition>
    <div className="min-h-[calc(100vh-56px)] bg-gradient-to-b from-white to-blue-200 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 tracking-tight">Informasi Laporan</h1>
        
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">No</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Judul</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800">
              {laporanDummy.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-500">{item.id}</td>
                  <td className="px-6 py-4 text-sm font-medium">{item.judul}</td>
                  <td className="px-6 py-4 text-sm">
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
                  <td className="px-6 py-4 text-sm text-gray-500">{item.tanggal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </PageTransition>
  );
}