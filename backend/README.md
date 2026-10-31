# Backend FacyPort

Backend FacyPort adalah REST API berbasis FastAPI untuk menerima laporan publik kampus, memoderasi dan merangkumnya dengan Gemini, mengelompokkan laporan serupa, serta menyediakan data ringkasan untuk dashboard.

## Daftar Isi

- [Teknologi](#teknologi)
- [Struktur Folder](#struktur-folder)
- [Prasyarat](#prasyarat)
- [Menjalankan Secara Lokal](#menjalankan-secara-lokal)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Alur Pemrosesan Laporan](#alur-pemrosesan-laporan)
- [API](#api)
- [Database](#database)
- [Pengujian](#pengujian)
- [Perintah Operasional](#perintah-operasional)
- [Catatan Deployment dan Keamanan](#catatan-deployment-dan-keamanan)

## Teknologi

- Python 3.14 atau lebih baru
- FastAPI dan Pydantic
- Turso/libSQL melalui `turso_serverless`
- Google Gemini untuk moderasi, peringkasan, dan embedding
- Upstash QStash untuk antrean pemrosesan laporan
- Cloudflare R2 untuk penyimpanan gambar privat
- SlowAPI untuk pembatasan laju request

## Struktur Folder

```text
backend/
├── main.py                 # Aplikasi FastAPI dan definisi endpoint
├── models.py               # Model request/response Pydantic
├── enums.py                # Status summary dan proses laporan
├── database.py             # Koneksi Turso
├── deps.py                 # Dependency autentikasi admin
├── migrate.py              # Pembuatan tabel database
├── repositories/
│   ├── report_repo.py      # Operasi data laporan
│   └── summary_repo.py     # Operasi data klaster/ringkasan
├── services/
│   ├── ai_service.py       # Integrasi Gemini dan embedding
│   ├── report_service.py   # Moderasi, clustering, dan penyimpanan laporan
│   ├── qstash_service.py   # Enqueue laporan ke QStash
│   └── storage_service.py  # Upload dan presigned URL Cloudflare R2
├── qstash_setup.py         # Konfigurasi Flow Control QStash
├── flush_db.py             # Mengosongkan tabel laporan dan ringkasan
├── flush_s3.py             # Menghapus seluruh objek di bucket R2
└── test_*.py               # Skrip pengujian dan benchmark
```

## Prasyarat

Sebelum menjalankan backend, siapkan:

1. Python **3.14+**.
2. Database Turso/libSQL dan kredensialnya.
3. API key Google Gemini.
4. QStash token, URL publik backend, serta signing keys untuk worker.
5. Kredensial Cloudflare R2 jika laporan akan menyimpan gambar.

## Menjalankan Secara Lokal

Dari folder `backend`, buat virtual environment dan pasang dependency:

```powershell
py -3.14 -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -e . "uvicorn[standard]" httpx
```

`httpx` digunakan oleh skrip pengujian. Jika PowerShell menolak aktivasi virtual environment, jalankan interpreter langsung melalui `.\venv\Scripts\python.exe`.

Buat file `.env.development.local` di folder `backend` (lihat [Konfigurasi Environment](#konfigurasi-environment)), kemudian siapkan tabel dan jalankan server:

```powershell
python migrate.py
python -m uvicorn main:app --reload
```

Atau gunakan target `dev` pada makefile:

```powershell
make dev
```

Secara default Uvicorn berjalan di `http://127.0.0.1:8000`. Dokumentasi interaktif tersedia di `/docs`, sedangkan dokumentasi ReDoc tersedia di `/redoc`.

## Konfigurasi Environment

Buat `backend/.env.development.local`. Jangan commit file ini atau memasukkan kredensial nyata ke dokumentasi.

```dotenv
# Turso/libSQL — wajib
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=

# Admin — wajib saat aplikasi diimpor
ADMIN_SECRET_KEY=

# Gemini — wajib untuk pemrosesan laporan
AI_API_KEY=
# Alternatif nama untuk AI_API_KEY:
# GEMINI_API_KEY=

# QStash — diperlukan oleh endpoint penerimaan laporan
QSTASH_TOKEN=
APP_BASE_URL=https://<URL-publik-backend>

# Signing key QStash — atur untuk verifikasi callback worker
QSTASH_CURRENT_SIGNING_KEY=
QSTASH_NEXT_SIGNING_KEY=

# Cloudflare R2 — diperlukan untuk menyimpan gambar laporan
CF_ACCOUNT_ID=
CF_R2_ACCESS_KEY_ID=
CF_R2_SECRET_ACCESS_KEY=
CF_R2_BUCKET_NAME=
```

`APP_BASE_URL` harus menunjuk ke URL backend yang dapat dijangkau QStash, tanpa perlu menambahkan `/api/worker/process-report`; path tersebut ditambahkan oleh backend.

## Alur Pemrosesan Laporan

1. Klien mengirim teks dan, bila ada, gambar ke `POST /api/reports`.
2. Backend mencoba mengunggah gambar ke bucket privat R2, lalu mengirim payload laporan ke antrean QStash `gemini-queue`.
3. QStash memanggil `POST /api/worker/process-report`.
4. Worker meminta Gemini memeriksa relevansi dan kata tidak pantas, menentukan kategori, membuat ringkasan, serta mengekstrak kata kunci.
5. Untuk laporan valid, backend membuat embedding Gemini lalu mencari klaster terdekat di Turso. Klaster yang memiliki kemiripan minimal **0.85** diperbarui; jika tidak ditemukan, klaster baru dibuat.
6. Laporan yang tidak valid dikembalikan dengan status proses `DISCARDED`. Laporan valid menghasilkan `CLUSTERED` atau `NEW_TOPIC`.

Gambar laporan disimpan sebagai object key di database. URL gambar yang dikembalikan endpoint detail laporan adalah presigned URL sementara (default berlaku satu jam).

## API

Prefix endpoint laporan, ringkasan, dan kategori adalah `/api`.

| Method | Endpoint | Autentikasi | Keterangan |
|---|---|---|---|
| `GET` | `/health` | Tidak | Memeriksa aplikasi sekaligus koneksi database Turso. |
| `POST` | `/api/reports` | Tidak | Menerima laporan multipart dan memasukkannya ke antrean QStash. Batas 30 request per menit per alamat IP. |
| `POST` | `/api/worker/process-report` | QStash callback | Worker internal untuk memproses payload laporan. |
| `GET` | `/api/reports/{report_id}` | Tidak | Mengambil laporan berdasarkan ID beserta presigned URL gambar jika ada. |
| `GET` | `/api/summaries` | Tidak | Mengambil semua klaster ringkasan. |
| `GET` | `/api/summaries/{summary_id}` | Tidak | Mengambil satu klaster ringkasan. |
| `PATCH` | `/api/summaries/{summary_id}/status` | Bearer admin | Memperbarui status penanganan klaster. |
| `GET` | `/api/categories` | Tidak | Mengambil kategori unik dari data klaster. |

### Mengirim laporan

`POST /api/reports` menerima `multipart/form-data`:

- `raw_text` (**wajib**): isi laporan.
- `image` (opsional): berkas gambar.

Contoh:

```bash
curl -X POST http://127.0.0.1:8000/api/reports \
  -F "raw_text=Lampu lorong gedung utama mati sejak pagi" \
  -F "image=@./lampu.jpg"
```

Respons diterima secara asynchronous dengan HTTP `202 Accepted`, contohnya:

```json
{
  "status": "queued",
  "message": "Laporan berhasil diterima dan masuk ke antrean pemrosesan AI.",
  "message_id": "id-pesan-qstash"
}
```

Respons tersebut berarti laporan berhasil dimasukkan ke antrean, bukan berarti pemrosesan AI sudah selesai.

### Melihat hasil laporan dan klaster

```http
GET /api/reports/123
GET /api/summaries
GET /api/summaries/10
GET /api/categories
```

Hasil proses worker berisi `summary_id`, `summary`, `category`, `match_score`, `has_profanity`, `process_status`, dan `reason`. `summary_id`, `summary`, `category`, serta `match_score` dapat bernilai `null` untuk laporan yang ditolak sebagai tidak valid.

### Memperbarui status klaster

Endpoint ini memerlukan header Bearer dengan nilai yang sama dengan `ADMIN_SECRET_KEY`:

```bash
curl -X PATCH http://127.0.0.1:8000/api/summaries/10/status \
  -H "Authorization: Bearer <ADMIN_SECRET_KEY>" \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"IN_PROGRESS\"}"
```

Nilai status summary yang tersedia:

- `SUBMITTED`
- `IN_PROGRESS`
- `RESOLVED`

Status proses laporan yang didefinisikan backend adalah `CLUSTERED`, `NEW_TOPIC`, `DISCARDED`, dan `FLAGGED`. Pipeline saat ini mengembalikan tiga status pertama; `FLAGGED` belum digunakan dalam alur pemrosesan.

## Database

Jalankan `python migrate.py` untuk membuat tabel jika belum tersedia:

- **`summaries`**: ringkasan, kategori, kata kunci, jumlah laporan, status, embedding, dan waktu pembuatan.
- **`reports`**: teks asli, object key gambar, ID klaster, flag profanity, dan waktu pembuatan.
- **`users`**: tabel yang dibuat oleh migrasi, tetapi belum digunakan oleh alur API saat ini.

Repository melakukan commit setelah operasi tulis. Jangan menjalankan migrasi terhadap database produksi tanpa memastikan kredensial dan target database sudah benar.

## Pengujian

Skrip yang tersedia menggunakan layanan eksternal dan konfigurasi environment:

```powershell
python test_ai_service.py
python test_report_flow.py
```

- `test_ai_service.py` menguji moderasi dan peringkasan Gemini, termasuk contoh gambar.
- `test_report_flow.py` menjalankan alur Gemini dan Turso, serta dapat menambah atau mengubah data laporan/klaster.
- `test_stress_prod.py` adalah benchmark yang mengirim request ke URL deployment yang tertulis di dalam skrip. Periksa dan ubah targetnya sebelum dijalankan; jangan arahkan benchmark ke layanan yang bukan milik atau tanpa izin pengujian.

Target `make test` menjalankan dua skrip pertama. Skrip-skrip tersebut **bukan** unit test terisolasi: skrip dapat memanggil API eksternal dan mengubah database, sehingga gunakan kredensial dan database pengujian.

## Perintah Operasional

Perintah berikut tersedia di makefile:

| Perintah | Efek |
|---|---|
| `make test` | Menjalankan `test_ai_service.py` dan `test_report_flow.py`. |
| `make test-ai` | Menjalankan pengujian Gemini. |
| `make test-flow` | Menjalankan pengujian alur laporan. |
| `make flush-db` | Menghapus seluruh data dari tabel `reports` dan `summaries`. |
| `make flush-s3` | Menghapus seluruh objek di bucket Cloudflare R2 yang dikonfigurasi. |
| `make flush` | Menjalankan kedua operasi penghapusan di atas. |

`flush_db.py` dan `flush_s3.py` meminta konfirmasi sebelum menghapus data. Operasi ini destruktif dan tidak dapat dibatalkan; pastikan environment menunjuk ke database dan bucket yang benar. Target `make test-flush` menjalankan pengujian lalu mengonfirmasi penghapusan database dan bucket secara otomatis—gunakan hanya pada environment disposable.

Untuk menyiapkan Flow Control QStash:

```powershell
python qstash_setup.py
```

Skrip tersebut mengatur flow control `gemini-rate-limit` menjadi maksimal satu worker paralel dan 15 request per 60 detik.

## Catatan Deployment dan Keamanan

- Atur `APP_BASE_URL` ke URL publik yang dapat menerima callback QStash.
- Atur signing keys QStash agar callback worker dapat diverifikasi. Pada implementasi saat ini, verifikasi hanya dijalankan bila header `Upstash-Signature` dan `QSTASH_CURRENT_SIGNING_KEY` sama-sama tersedia; pastikan konfigurasi deployment tidak membiarkan callback tanpa verifikasi.
- CORS saat ini mengizinkan semua origin, method, dan header. Batasi origin ke domain frontend yang benar untuk deployment produksi.
- Endpoint pembaruan status menggunakan autentikasi Bearer sederhana melalui `ADMIN_SECRET_KEY`; simpan secret dengan aman dan jangan gunakan nilai development di produksi.
- Endpoint penerimaan laporan dibatasi 30 request per menit per IP. Aturan limiter tambahan dapat dikonfigurasi sesuai kebutuhan deployment.
- Jangan gunakan skrip flush atau benchmark terhadap layanan produksi tanpa persetujuan dan pemeriksaan target.
