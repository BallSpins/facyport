'use client';

export default function FormLaporan() {
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Form Laporan</h1>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nama Pelapor</label>
          <input
            type="text"
            placeholder="Masukkan nama"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Kategori</label>
          <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Pilih kategori</option>
            <option value="fasilitas">Fasilitas</option>
            <option value="kebersihan">Kebersihan</option>
            <option value="keamanan">Keamanan</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Deskripsi Laporan</label>
          <textarea
            rows={4}
            placeholder="Jelaskan masalah yang Anda temukan..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Upload Foto (opsional)</label>
          <input
            type="file"
            accept="image/*"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium"
        >
          Kirim Laporan
        </button>
      </form>
    </div>
  );
}

