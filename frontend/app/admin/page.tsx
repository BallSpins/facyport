export const instant = false;

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard Admin</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">Total Laporan</p>
          <p className="text-3xl font-bold">24</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">Sedang Diproses</p>
          <p className="text-3xl font-bold text-yellow-500">8</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">Selesai</p>
          <p className="text-3xl font-bold text-green-500">16</p>
        </div>
      </div>
    </div>
  );
}

