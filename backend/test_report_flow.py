import os
import json
from dotenv import load_dotenv
from database import get_db_connection
from services.ai_service import AIService
from services.report_service import ReportService

# Load environment
load_dotenv(".env.development.local")

api_key = os.getenv("AI_API_KEY") or os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("API Key belum terkonfigurasi di file .env.development.local")

def run_e2e_campus_tests():
    print("=== STARTING E2E CAMPUS REPORT SERVICE TESTS ===\n")

    # Inisialisasi DB & Service
    db_conn = get_db_connection()
    ai_service = AIService(api_key=api_key)
    report_service = ReportService(db_conn=db_conn, ai_service=ai_service)

    # ----------------------------------------------------------------------
    # TEST 1: Aduan Kampus Baru (Harus buat Cluster Topik Baru)
    # ----------------------------------------------------------------------
    print("[TEST 1] Aduan Fasilitas Kelas (Topik Baru)...")
    text_1 = "AC di ruang kuliah Gedung Sains F1 mati total dari pagi, ruangan panas banget buat kuliah Fisika."
    
    res_1 = report_service.process_incoming_report(incoming_text=text_1)
    print("Hasil Test 1:")
    print(json.dumps(res_1, indent=2, ensure_ascii=False))
    print("-" * 60)

    target_summary_id = res_1.get("summary_id")

    # ----------------------------------------------------------------------
    # TEST 2: Aduan Mirip / Duplikat (Harus Memicu Clustering ke Test 1)
    # ----------------------------------------------------------------------
    print("\n[TEST 2] Aduan Mirip (Harus Digabung ke Cluster Test 1)...")
    text_2 = "Ruangan F1 panas banget gara-gara AC mati, tolong segera diperbaiki pendingin acuannya."
    
    res_2 = report_service.process_incoming_report(incoming_text=text_2)
    print("Hasil Test 2:")
    print(json.dumps(res_2, indent=2, ensure_ascii=False))

    if res_2.get("summary_id") == target_summary_id:
        print("\n[SUCCESS] Clustering Berhasil! Aduan kedua otomatis digabung ke topik AC Gedung F1.")
    else:
        print("\n[NOTE] Laporan terdeteksi sebagai topik terpisah.")
    print("-" * 60)

    # ----------------------------------------------------------------------
    # TEST 3: Spam / Joki / Iklan di Luar Konteks Kampus
    # ----------------------------------------------------------------------
    print("\n[TEST 3] Aduan Spam / Promosi Joki Tugas...")
    text_3 = "Jual chip domino dan joki skripsi kilat harga murah 50rb langsung acc klik link bit.ly/jokigacor"
    
    res_3 = report_service.process_incoming_report(incoming_text=text_3)
    print("Hasil Test 3:")
    print(json.dumps(res_3, indent=2, ensure_ascii=False))
    print("-" * 60)

    # ----------------------------------------------------------------------
    # TEST 4: Aduan Multimodal Foto Kerusakan Kampus (Teks + Gambar)
    # ----------------------------------------------------------------------
    print("\n[TEST 4] Aduan dengan Foto Kerusakan Fasilitas Kampus...")
    text_4 = "Atap plafon bocor dan jebol di lorong perpustakaan pusat, air menggenang membahayakan mahasiswa."
    sample_img_url = "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600"
    
    res_4 = report_service.process_incoming_report(incoming_text=text_4, img_url=sample_img_url)
    print("Hasil Test 4:")
    print(json.dumps(res_4, indent=2, ensure_ascii=False))
    print("-" * 60)

if __name__ == "__main__":
    run_e2e_campus_tests()