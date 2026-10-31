import Link from 'next/link';

export default function ReportListPage() {
  const reports = [
    { id: '1', judul: 'AC Rusak di Gedung A', pelapor: 'Budi', status: 'Diproses', tanggal: '2026-10-30' },
    { id: '2', judul: 'Lampu Mati di Koridor B', pelapor: 'Siti', status: 'Selesai', tanggal: '2026-10-28' },
    { id: '3', judul: 'Kebocoran Atap Lab C', pelapor: 'Andi', status: 'Menunggu', tanggal: '2026-10-31' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Daftar Report</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-sm font-medium">ID</th>
              <th className="px-4 py-3 text-sm font-medium">Judul</th>
              <th className="px-4 py-3 text-sm font-medium">Pelapor</th>
              <th className="px-4 py-3 text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-sm font-medium">Tanggal</th>
              <th className="px-4 py-3 text-sm font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
            {reports.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 text-sm">{r.id}</td>
                <td className="px-4 py-3 text-sm">{r.judul}</td>
                <td className="px-4 py-3 text-sm">{r.pelapor}</td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      r.status === 'Selesai'
                        ? 'bg-green-100 text-green-700'
                        : r.status === 'Diproses'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">{r.tanggal}</td>
                <td className="px-4 py-3 text-sm">
                  <Link href={`/admin/report/${r.id}`} className="text-blue-600 hover:underline">
                    Detail
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

