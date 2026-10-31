import os
import base64
from fastapi import FastAPI, HTTPException, status, Request, Form, File, UploadFile, Depends
from deps import verify_admin_token
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from dotenv import load_dotenv
from typing import Optional
from qstash import Receiver

from database import get_db_connection

# Repositories & Services
from repositories.summary_repo import SummaryRepository
from repositories.report_repo import ReportRepository
from services.report_service import ReportService
from services.ai_service import AIService
from services.storage_service import StorageService
from services.qstash_service import QStashService

# DTOs / Schemas
from models import (
  ReportCreate,
  ReportResponse,
  ReportProcessResult,
  SummaryResponse,
  SummaryUpdateStatus,
)

load_dotenv(".env.development.local")

# Rate Limiter Configuration
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
  title="FacyPort API",
  description="Backend Service untuk Agregasi, Moderasi, dan Transparansi Laporan Publik Kampus",
  version="1.0.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# --- CORS MIDDLEWARE (Wajib untuk integrasi Next.js) ---
app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],  # Pada production ganti dengan domain spesifik Next.js
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

qstash_receiver = Receiver(
  current_signing_key=os.getenv("QSTASH_CURRENT_SIGNING_KEY", ""),
  next_signing_key=os.getenv("QSTASH_NEXT_SIGNING_KEY", ""),
)

def get_ai_service() -> AIService:
  """Helper untuk menginisialisasi AIService dengan API Key dari Environment Variable."""
  api_key = os.getenv("AI_API_KEY") or os.getenv("GEMINI_API_KEY")
  if not api_key:
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail="API Key untuk Gemini Service belum dikonfigurasi pada environment server.",
    )
  return AIService(api_key=api_key)


# --- HEALTH CHECK ---
@app.get("/health", tags=["Health Check"])
def read_root():
  """Pengecekan status backend dan verifikasi koneksi ke Turso DB."""
  db = get_db_connection()
  cursor = db.execute("SELECT 'koneksi turso berhasil' AS status")
  result = cursor.fetchall()
  return {"status": "ok", "db": result[0][0]}


# --- ENDPOINTS LAPORAN (REPORTS) ---
@app.post(
    "/api/reports-sync",
    response_model=ReportProcessResult,
    status_code=status.HTTP_201_CREATED,
    tags=["Reports"],
)
@limiter.limit("30/minute")
async def create_report(
    request: Request,
    raw_text: str = Form(...),
    image: Optional[UploadFile] = File(None)
):
    db = get_db_connection()
    ai_service = get_ai_service()
    service = ReportService(db_conn=db, ai_service=ai_service)

    file_bytes: Optional[bytes] = None
    img_key: Optional[str] = None

    if image and image.filename:
        file_bytes = await image.read()
        if len(file_bytes) > 0:
            try:
                storage_service = StorageService()
                # Simpan ke R2 Private Bucket
                img_key = storage_service.upload_private_file(
                    file_bytes=file_bytes,
                    content_type=image.content_type or "image/jpeg"
                )
            except Exception as e:
                print(f"[!] Gagal upload ke R2 Private Storage: {e}")

    # Jalankan AI Pipeline menggunakan file_bytes yang ada di memori
    result = service.process_incoming_report(
        incoming_text=raw_text,
        img_bytes=file_bytes,
        img_key=img_key
    )
    return result


@app.post(
    "/api/reports",
    status_code=status.HTTP_202_ACCEPTED,
    tags=["Reports"],
)
@limiter.limit("30/minute")
async def create_report(
    request: Request,
    raw_text: str = Form(...),
    image: Optional[UploadFile] = File(None)
):
    file_bytes_b64: Optional[str] = None
    img_key: Optional[str] = None

    if image and image.filename:
        file_bytes = await image.read()
        if len(file_bytes) > 0:
            try:
                storage_service = StorageService()
                # Simpan ke R2 Private Bucket
                img_key = storage_service.upload_private_file(
                    file_bytes=file_bytes,
                    content_type=image.content_type or "image/jpeg"
                )
            except Exception as e:
                print(f"[!] Gagal upload ke R2 Storage: {e}")

            file_bytes_b64 = base64.b64encode(file_bytes).decode("utf-8")

    payload = {
        "raw_text": raw_text,
        "img_bytes_b64": file_bytes_b64,
        "img_key": img_key,
    }

    try:
        qstash_service = QStashService()
        res = qstash_service.enqueue_report(payload)
        return {
            "status": "queued",
            "message": "Laporan berhasil diterima dan masuk ke antrean pemrosesan AI.",
            "message_id": getattr(res, "message_id", str(res))
        }
    except Exception as e:
        print(f"[!] Gagal enqueue ke QStash: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gagal memasukkan laporan ke dalam antrean sistem."
        )


# --- 2. WORKER ENDPOINT (PENERIMA PANGGILAN DARI QSTASH) ---
@app.post(
    "/api/worker/process-report",
    tags=["Worker"],
)
async def worker_process_report(request: Request):
    """
    Endpoint ini dipanggil oleh Server QStash melalui HTTP POST secara otomatis.
    Di sinilah AIService & ReportService dieksekusi.
    """
    body_bytes = await request.body()
    signature = request.headers.get("Upstash-Signature")

    # Verifikasi keamanan request (hanya menerima request sah dari QStash)
    if signature and os.getenv("QSTASH_CURRENT_SIGNING_KEY"):
        try:
            qstash_receiver.verify(body=body_bytes.decode("utf-8"), signature=signature)
        except Exception as e:
            print(f"[!] Invalid QStash Signature: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Verifikasi Upstash Signature gagal."
            )

    payload = await request.json()
    raw_text = payload.get("raw_text")
    img_bytes_b64 = payload.get("img_bytes_b64")
    img_key = payload.get("img_key")

    img_bytes = base64.b64decode(img_bytes_b64) if img_bytes_b64 else None

    # MEMANGGIL SERVICE AI & DB DI SINI
    db = get_db_connection()
    ai_service = get_ai_service()
    service = ReportService(db_conn=db, ai_service=ai_service)

    result = service.process_incoming_report(
        incoming_text=raw_text,
        img_bytes=img_bytes,
        img_key=img_key
    )

    return {"status": "success", "result": result}

@app.get(
  "/api/reports/{report_id}",
  response_model=ReportResponse,
  tags=["Reports"],
)
def get_report_by_id(report_id: int):
  """Mengambil detail aduan individu berdasarkan ID."""
  db = get_db_connection()
  repo = ReportRepository(db)
  report = repo.get_by_id(report_id)

  if not report:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail=f"Report dengan ID {report_id} tidak ditemukan.",
    )

  if report.get("img_url"):
    storage_service = StorageService()
    report["img_url"] = storage_service.get_presigned_url(report["img_url"])

  return report


# --- ENDPOINTS KLASTER (SUMMARIES) ---
@app.get(
  "/api/summaries",
  response_model=list[SummaryResponse],
  tags=["Summaries"],
)
def get_all_summaries():
  """Mengambil seluruh daftar klaster isu/summary untuk dashboard admin atau publik."""
  db = get_db_connection()
  repo = SummaryRepository(db)
  return repo.get_all()


@app.get(
  "/api/summaries/{summary_id}",
  response_model=SummaryResponse,
  tags=["Summaries"],
)
def get_summary_by_id(summary_id: int):
  """Mengambil detail satu klaster isu berdasarkan ID."""
  db = get_db_connection()
  repo = SummaryRepository(db)
  summary = repo.get_by_id(summary_id)

  if not summary:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail=f"Summary dengan ID {summary_id} tidak ditemukan.",
    )
  return summary


@app.patch(
  "/api/summaries/{summary_id}/status",
  response_model=SummaryResponse,
  tags=["Summaries"],
)
def update_summary_status(
  summary_id: int, 
  payload: SummaryUpdateStatus,
  is_admin: bool = Depends(verify_admin_token)
):
  """
  Memperbarui status penanganan isu (SUBMITTED -> IN_PROGRESS -> RESOLVED).
  Khusus digunakan oleh Admin/Petugas kampus.
  """
  db = get_db_connection()
  repo = SummaryRepository(db)

  existing = repo.get_by_id(summary_id)
  if not existing:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail=f"Summary dengan ID {summary_id} tidak ditemukan.",
    )

  repo.update_status(summary_id, payload.status)
  return repo.get_by_id(summary_id)


# --- ENDPOINT KATEGORI ---
@app.get(
  "/api/categories",
  response_model=list[str],
  tags=["Categories"],
)
def get_all_categories():
  """Mengambil daftar seluruh kategori unik yang ada di database."""
  db = get_db_connection()
  repo = SummaryRepository(db)
  return repo.get_all_categories()