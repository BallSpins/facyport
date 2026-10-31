export default function InformasiPage() {
  const laporanDummy = [
    { id: 1, judul: 'AC Rusak di Gedung A', status: 'Diproses', tanggal: '2026-10-30' },
    { id: 2, judul: 'Lampu Mati di Koridor B', status: 'Selesai', tanggal: '2026-10-28' },
    { id: 3, judul: 'Kebocoran Atap Lab C', status: 'Menunggu', tanggal: '2026-10-31' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Informasi Laporan</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-sm font-medium">No</th>
              <th className="px-4 py-3 text-sm font-medium">Judul</th>
              <th className="px-4 py-3 text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-sm font-medium">Tanggal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
            {laporanDummy.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 text-sm">{item.id}</td>
                <td className="px-4 py-3 text-sm">{item.judul}</td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                <td className="px-4 py-3 text-sm">{item.tanggal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

