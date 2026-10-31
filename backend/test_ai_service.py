import os
import json
import httpx
from dotenv import load_dotenv
from services.ai_service import AIService

load_dotenv(".env.development.local")

api_key = os.getenv("AI_API_KEY") or os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("API Key belum terkonfigurasi di file .env.development.local")

ai_service = AIService(api_key)

def create_test_prompt(incoming_text: str) -> str:
    categories_str = "Fasilitas Kelas, Kebersihan Kampus, Keamanan & Ketertiban, Layanan Akademik, Umum"
    return f"""
    Kamu adalah mesin validasi dan ekstraksi laporan publik kampus. Tugasmu HANYA mengevaluasi teks laporan yang diberikan dan mengembalikan JSON sesuai format.

    KONTEKS SISTEM:
    Daftar Kategori Resmi: [{categories_str}]

    ATURAN KETAT:
    1. Hanya kembalikan format JSON murni.
    2. `is_valid` = `true` jika berupa aduan/informasi lingkungan kampus yang relevan. `false` jika berupa spam, ketikan acak, promosi, atau joki.
    3. `has_profanity` = `true` jika mengandung kata kotor, makian, atau ujaran kebencian.
    4. `category` = Wajib memilih tepat SATU dari "Daftar Kategori Resmi". Dilarang membuat nama kategori baru di luar daftar tersebut.
    5. `summary` = ringkas laporan menjadi 1 kalimat naratif padat (8-10 kata). Jika `is_valid` = `false`, isi dengan `null`.
    6. `keywords` = array berisi 3-6 kata kunci utama dalam bentuk kata dasar (lowercase, tanpa kata hubung/stopwords).

    FORMAT OUTPUT:
    {{
      "is_valid": boolean,
      "has_profanity": boolean,
      "category": string,
      "summary": string | null,
      "keywords": list[string]
    }}

    TEKS LAPORAN:
    "{incoming_text}"
    """

def run_tests():
    print("=== STARTING AI SERVICE CAMPUS TEST CASES ===\n")

    # ----------------------------------------------------------------------
    # TEST 1: Laporan Valid Kampus (Fasilitas Kelas)
    # ----------------------------------------------------------------------
    print("[TEST 1] Laporan Valid Kerusakan Fasilitas Kelas...")
    text_valid = "AC di Ruang Kuliah 201 Gedung Utama mati total dari pagi, mahasiswa kepanasan dan proyektor juga bergaris."
    res_1 = ai_service.moderate_and_summarize(create_test_prompt(text_valid), None)
    print(json.dumps(res_1, indent=2, ensure_ascii=False))
    print("-" * 50)

    # ----------------------------------------------------------------------
    # TEST 2: Laporan Spam / Iklan Joki Tugas Kampus
    # ----------------------------------------------------------------------
    print("\n[TEST 2] Laporan Spam / Promosi Joki Tugas...")
    text_spam = "Jual chip domino & joki skripsi kilat harga murah 50rb langsung acc klik link bit.ly/jokigacor"
    res_2 = ai_service.moderate_and_summarize(create_test_prompt(text_spam), None)
    print(json.dumps(res_2, indent=2, ensure_ascii=False))
    print("-" * 50)

    # ----------------------------------------------------------------------
    # TEST 3: Laporan Mengandung Makian / Profanity dari Mahasiswa
    # ----------------------------------------------------------------------
    print("\n[TEST 3] Laporan Mengandung Makian / Profanity...")
    text_profanity = "Woi birokrasi kampus ga becus jancok, wifi perpustakaan mati mulu dari kemarin padahal besok deadline tugas anjing!"
    res_3 = ai_service.moderate_and_summarize(create_test_prompt(text_profanity), None)
    print(json.dumps(res_3, indent=2, ensure_ascii=False))
    print("-" * 50)

    # ----------------------------------------------------------------------
    # TEST 4: Laporan Multimodal (Teks + Foto Kerusakan Kampus)
    # ----------------------------------------------------------------------
    print("\n[TEST 4] Laporan Multimodal dengan Foto Fasilitas Kampus...")
    text_multimodal = "Plafon atap bocor dan jebol di lorong lantai 2 perpustakaan pusat, air menggenang membahayakan."
    sample_img_url = "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600"
    
    # Ambil bytes gambar untuk simulasi file upload
    img_bytes = httpx.get(sample_img_url).content
    
    prompt_4 = create_test_prompt(text_multimodal)
    res_4 = ai_service.moderate_and_summarize(prompt_4, img_bytes=img_bytes)
    print(json.dumps(res_4, indent=2, ensure_ascii=False))
    print("-" * 50)

if __name__ == "__main__":
    run_tests()