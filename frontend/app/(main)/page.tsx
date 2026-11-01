import Link from 'next/link';
import PageTransition from '../components/PageTransition';
import Image from 'next/image'; // Opsional jika pakai Next.js Image, atau pakai tag <img> biasa

export default function HomePage() {
  return (
    <PageTransition>
    <div className="min-h-[calc(100vh-56px)] px-6 sm:px-12 md:px-24 grid grid-cols-1 lg:grid-cols-2 items-center justify-center bg-gradient-to-b from-white to-blue-200">

      {/* Kolom Kiri: Teks dan Tombol */}
      <div className="flex flex-col items-start justify-center py-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-4">
          Selamat Datang di <span className="text-blue-600">Facyport</span>
        </h1>
        <p className="text-base sm:text-lg text-black mb-8 max-w-xl text-left">
          Platform pelaporan fasilitas kampus yang cepat, mudah, dan transparan.
        </p>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <Link
            href="/form"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-center"
          >
            Buat Laporan
          </Link>
          <Link
            href="/informasi"
            className="px-6 py-3 rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-medium text-center"
          >
            Lihat Informasi
          </Link>
        </div>
      </div>

      {/* Kolom Kanan: Gambar (Hanya muncul di layar Desktop / lg ke atas) */}
      <div className="hidden lg:flex justify-center items-center p-6">
        <svg
          className="w-full max-w-2xl h-auto text-blue-600" /* Ubah text-blue-600 sesuai keinginan */
          fill="currentColor" /* Membuat elemen SVG mengikuti warna dari kelas teks */
          viewBox="0 0 24 24"
        >
          {/* Paste semua kode <path> yang ada di dalam file SVG kamu di sini */}
          <path d="M12 3L1 9l11 6 9-4.917V17h2V9L12 3z..." />
        </svg>
      </div>

    </div>

    {/* ================= FITUR UNGGULAN ================= */}
        <section className="py-20 px-6 sm:px-12 md:px-24 bg-white border-t border-gray-100">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Keunggulan Sistem</h2>
              <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Solusi Cerdas Penanganan Fasilitas
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-2xl mb-6">
                  🤖
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Moderasi AI Otomatis</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Penyaringan aduan spam, deskripsi acak, serta ujaran tidak layak secara instan menggunakan teknologi Gemini AI sebelum masuk ke sistem.
                </p>
              </div>

              {/* Card 2 */}
              <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-2xl mb-6">
                  📊
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Deduplication</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Laporan berulang mengenai kerusakan yang sama di lokasi serupa otomatis digabungkan menjadi satu topik klaster terpusat.
                </p>
              </div>

              {/* Card 3 */}
              <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-bold text-2xl mb-6">
                  🔍
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Transparansi Real-Time</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Publik dan pelapor dapat memantau perkembangan penanganan laporan secara terbuka mulai dari tahap Menunggu, Diproses, hingga Selesai.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= ALUR PELAPORAN ================= */}
        <section className="py-20 px-6 sm:px-12 md:px-24 bg-gradient-to-b from-blue-50 to-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Alur Kerja</h2>
              <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Bagaimana Facyport Bekerja?
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { step: '01', title: 'Kirim Aduan', desc: 'Isi ringkasan kendala dan unggah foto bukti kerusakan fasilitas.' },
                { step: '02', title: 'Analisis AI', desc: 'AI memeriksa kelayakan dan mencocokkan isu dengan aduan lain.' },
                { step: '03', title: 'Tindak Lanjut', desc: 'Pengelola kampus menerima klaster isu dan melakukan perbaikan.' },
                { step: '04', title: 'Pantau Real-time', desc: 'Seluruh pelapor dapat memantau perkembangan status laporan secara transparan di halaman Informasi.' },
              ].map((item) => (
                <div key={item.step} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                  <span className="text-4xl font-black text-blue-100 absolute top-3 right-4 select-none">
                    {item.step}
                  </span>
                  <h4 className="text-lg font-bold text-gray-900 mb-2 relative z-10">{item.title}</h4>
                  <p className="text-xs text-gray-600 leading-relaxed relative z-10">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= TARGET PENGGUNA & BANNER CTA ================= */}
        <section className="py-20 px-6 sm:px-12 md:px-24 bg-white">
          <div className="max-w-5xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-10 sm:p-16 text-white text-center shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight">
                Siap Melaporkan Kendala Fasilitas Kampus?
              </h2>
              <p className="text-blue-100 text-sm sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed">
                Bantu tingkatkan kualitas perkuliahan dengan memberikan laporan fasilitas yang akurat dan dapat ditindaklanjuti secara terarah.
              </p>
              <Link
                href="/form"
                className="inline-block px-8 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
              >
                Buat Laporan Sekarang
              </Link>
            </div>
          </div>
        </section>

        {/* ================= FOOTER ================= */}
        <footer className="py-8 border-t border-gray-200 bg-gray-50 text-center text-xs text-gray-500">
          <p>© 2026 Facyport. Sistem Pengaduan Fasilitas Kampus Berbasis AI.</p>
        </footer>
    </PageTransition>
  );
}