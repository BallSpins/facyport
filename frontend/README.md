# Frontend FacyPort

Frontend FacyPort adalah aplikasi web berbasis Next.js untuk pelaporan fasilitas kampus. Pengunjung dapat mengirim laporan dan melihat ringkasan isu, sedangkan admin dapat masuk ke dashboard untuk memantau klaster dan memperbarui status penanganan.

## Daftar Isi

- [Teknologi](#teknologi)
- [Struktur Folder](#struktur-folder)
- [Prasyarat](#prasyarat)
- [Menjalankan Secara Lokal](#menjalankan-secara-lokal)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Halaman dan Fitur](#halaman-dan-fitur)
- [Integrasi API](#integrasi-api)
- [Autentikasi Admin](#autentikasi-admin)
- [Pengujian dan Build](#pengujian-dan-build)
- [Deployment](#deployment)
- [Catatan Keamanan dan Integrasi](#catatan-keamanan-dan-integrasi)

## Teknologi

- Node.js **20.9 atau lebih baru**
- Next.js 16 dengan App Router
- React 19 dan TypeScript
- Tailwind CSS 4
- Framer Motion untuk animasi
- `@libsql/client` untuk koneksi Turso dari server Next.js
- `jose` dan `bcryptjs` untuk JWT dan verifikasi password

## Struktur Folder

```text
frontend/
├── app/
│   ├── (main)/                 # Halaman publik dengan navbar
│   │   ├── page.tsx            # Beranda
│   │   ├── form/page.tsx       # Form pengiriman laporan
│   │   └── informasi/page.tsx  # Daftar dan filter ringkasan laporan
│   ├── (auth)/login/page.tsx   # Form login admin
│   ├── admin/                  # Dashboard admin dan detail klaster
│   ├── api/
│   │   ├── auth/               # Endpoint login, logout, dan inisialisasi user
│   │   └── test-db/            # Endpoint diagnostik koneksi Turso
│   ├── components/             # Navbar, sidebar, dan transisi halaman
│   ├── globals.css             # Style global dan Tailwind
│   ├── layout.tsx              # Root layout dan metadata
│   └── template.tsx            # Template transisi halaman
├── lib/
│   ├── auth.ts                 # Pembuatan dan verifikasi JWT
│   ├── status.ts               # Pemetaan status ke label UI
│   └── turso.ts                # Klien database Turso
├── middleware.ts               # Proteksi navigasi halaman admin
├── next.config.ts              # Konfigurasi Next.js/Turbopack
├── package.json                # Scripts dan dependency
└── .env.local                  # Environment lokal (buat sendiri, jangan commit)
```

## Prasyarat

- Node.js 20.9 atau lebih baru.
- npm (lockfile yang tersedia adalah `package-lock.json`).
- Database Turso/libSQL untuk autentikasi admin.
- Backend FacyPort yang dapat dijangkau browser untuk laporan dan ringkasan.

## Menjalankan Secara Lokal

Dari folder `frontend`, pasang dependency berdasarkan lockfile:

```powershell
npm ci
```

Buat file `.env.local` sesuai bagian [Konfigurasi Environment](#konfigurasi-environment), lalu jalankan development server:

```powershell
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000). Next.js akan memuat perubahan source secara otomatis.

Perintah lain yang tersedia:

```powershell
npm run lint
npm run build
npm run start
```

`npm run start` menjalankan hasil build, sehingga jalankan `npm run build` terlebih dahulu.

## Konfigurasi Environment

Buat `frontend/.env.local` untuk pengembangan lokal. File `.env*` sudah diabaikan Git.

```dotenv
# Turso/libSQL — digunakan oleh route autentikasi dan diagnostik server
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=

# Secret untuk menandatangani dan memverifikasi cookie JWT — wajib di deployment
JWT_SECRET=

# Saat ini dibaca oleh halaman admin yang memperbarui status.
# Peringatan: variabel NEXT_PUBLIC_ dikirim ke browser dan bukan tempat aman
# untuk menyimpan ADMIN_SECRET_KEY. Lihat Catatan Keamanan dan Integrasi.
NEXT_PUBLIC_ADMIN_SECRET_KEY=
```

`JWT_SECRET` harus berupa nilai acak yang kuat dan sama untuk proses yang menandatangani serta memverifikasi token. Kode saat ini memiliki fallback development jika variabel ini tidak diberikan; jangan mengandalkan fallback tersebut.

Alamat backend **belum** dikonfigurasi melalui environment variable. Beberapa halaman memanggil URL deployment FacyPort secara langsung. Untuk menjalankan frontend terhadap backend lokal atau deployment lain, ubah URL `fetch()` yang relevan di halaman frontend sampai konfigurasi base URL dipindahkan ke environment.

## Halaman dan Fitur

| Route | Kegunaan |
|---|---|
| `/` | Beranda, pengenalan fitur, dan tautan ke form serta informasi laporan. |
| `/form` | Mengirim teks laporan dan foto opsional ke backend. |
| `/informasi` | Melihat, mencari, memfilter, dan mengurutkan klaster laporan publik. |
| `/login` | Login admin dengan username atau email dan password. |
| `/admin` | Dashboard ringkas jumlah klaster, status, dan laporan terbaru. |
| `/admin/report` | Daftar klaster; admin dapat mencari, memfilter, dan memperbarui status. |
| `/admin/report/{id}` | Detail klaster, kata kunci, jumlah pelapor, status, tanggal, dan foto jika tersedia. |

Halaman informasi menampilkan paling banyak delapan item per halaman; dashboard admin menampilkan lima item per halaman. Status backend `SUBMITTED`, `IN_PROGRESS`, dan `RESOLVED` ditampilkan masing-masing sebagai “Menunggu”, “Diproses”, dan “Selesai”.

## Integrasi API

### Backend FacyPort

Frontend saat ini menggunakan endpoint backend berikut:

| Method | Endpoint | Pemakaian |
|---|---|---|
| `POST` | `/api/reports` | Form mengirim `multipart/form-data` berisi `raw_text` dan `image` opsional. |
| `GET` | `/api/summaries` | Halaman Informasi dan dashboard/daftar admin mengambil klaster laporan. |
| `GET` | `/api/summaries/{summary_id}` | Halaman detail mengambil data klaster. |
| `PATCH` | `/api/summaries/{summary_id}/status` | Daftar admin mengubah status menggunakan token admin. |
| `GET` | `/api/summaries/{summary_id}/reports` | Halaman detail mencoba mengambil foto dari laporan dalam klaster. |

Pengiriman laporan bersifat asynchronous: respons sukses dari `POST /api/reports` berarti laporan masuk antrean, bukan berarti AI sudah selesai memprosesnya. UI menampilkan status dan ID antrean yang dikembalikan backend.

Endpoint `/api/summaries/{summary_id}/reports` saat ini dipanggil oleh halaman detail frontend, tetapi tidak tersedia pada daftar route backend yang terdokumentasi. Karena itu, data ringkasan masih dapat ditampilkan, tetapi daftar foto detail mungkin tidak muncul sampai endpoint tersebut tersedia.

### Route API Next.js

| Method | Endpoint | Kegunaan |
|---|---|---|
| `POST` | `/api/auth/login` | Memeriksa user di Turso, memverifikasi password, dan membuat cookie sesi. |
| `POST` | `/api/auth/logout` | Menghapus cookie sesi admin. |

## Autentikasi Admin

1. Form `/login` mengirim username/email dan password ke `/api/auth/login`.
2. Route login mengambil data user dari Turso dan membandingkan password dengan hash bcrypt.
3. Jika berhasil, server membuat JWT dengan masa berlaku tujuh hari dan menyimpannya dalam cookie `auth_token` beratribut `HttpOnly`, `SameSite=Lax`, dan `Secure` pada production.
4. Middleware memeriksa cookie sebelum mengizinkan navigasi ke `/admin`. Pengguna tanpa sesi diarahkan ke `/login`.
5. Logout memanggil `/api/auth/logout` untuk menghapus cookie.

Tabel `users` perlu tersedia di Turso dengan kolom `id`, `username`, `email`, dan `password` (hash bcrypt). Route `/api/auth/init` dapat membuat tabel dan melakukan bootstrap, tetapi sebaiknya proses provisioning akun admin dilakukan secara aman di luar endpoint publik.

## Pengujian dan Build

Skrip yang tersedia dalam `package.json`:

| Perintah | Kegunaan |
|---|---|
| `npm run lint` | Menjalankan ESLint pada project. |
| `npm run build` | Membuat production build Next.js. |
| `npm run start` | Menjalankan production build. |
| `npm run dev` | Menjalankan development server. |

Tidak ada script test otomatis yang didefinisikan saat ini.

## Deployment

1. Deploy folder `frontend` sebagai aplikasi Next.js.
2. Pasang dependency menggunakan `npm ci`.
3. Atur `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, dan `JWT_SECRET` pada environment deployment.
4. Pastikan frontend dapat mengakses backend dan backend mengizinkan origin frontend melalui CORS.
5. Jalankan build (`npm run build`); setelah berhasil, jalankan aplikasi menggunakan `npm run start` atau perintah start platform deployment.
6. Jangan membuka endpoint inisialisasi user atau diagnostik untuk penggunaan umum tanpa menambahkan proteksi yang sesuai.

## Catatan Keamanan dan Integrasi

- **Jangan gunakan fallback `JWT_SECRET`.** Tetapkan secret acak kuat untuk setiap environment dan rotasi jika pernah terekspos.
- **Jangan menyimpan secret admin di `NEXT_PUBLIC_*`.** Prefix tersebut menjadikan nilainya tersedia pada bundle browser. Saat ini halaman admin mengirim nilai `NEXT_PUBLIC_ADMIN_SECRET_KEY` langsung ke backend; ubah alur ini menjadi route server-side yang memeriksa sesi admin sebelum memasukkan kredensial backend.
- **Batasi atau hapus `/api/auth/init` sebelum production.** Endpoint GET ini membuat akun admin awal menggunakan kredensial default yang tertanam pada source dan dapat mengembalikan detail bootstrap. Jangan mengeksposnya ke publik; sediakan provisioning aman dan ubah kredensial awal sebelum aplikasi digunakan.
- **Middleware hanya mengatur akses halaman `/admin` dan `/login`.** Middleware bukan pengganti otorisasi pada API; endpoint yang mengubah data harus tetap memverifikasi identitas/otorisasi di server.
- **`/api/test-db` adalah endpoint diagnostik.** Batasi atau nonaktifkan di production dan hindari mengembalikan detail error database kepada pengguna.
- **URL backend masih hard-coded di beberapa halaman.** Samakan konfigurasi URL saat berpindah dari backend deployment ke lokal atau environment lain.
- Pastikan konfigurasi CORS backend mengizinkan origin frontend yang benar dan gunakan HTTPS untuk deployment.
