from .ai_service import AIService
from repositories.summary_repo import SummaryRepository
from repositories.report_repo import ReportRepository
from enums import ProcessStatus

class ReportService:
  def __init__(self, db_conn, ai_service: AIService):
    self.conn = db_conn
    self.ai = ai_service
    self.summary_repo = SummaryRepository(db_conn)
    self.report_repo = ReportRepository(db_conn)

  def process_incoming_report(self, incoming_text: str, img_url: str = None) -> dict:
    categories_list = self.summary_repo.get_all_categories() or ["Infrastruktur & Jalan", "Kebersihan & Lingkungan", "Keamanan & Ketertiban", "Fasilitas Umum", "Umum"]
    existing_categories_str = ", ".join(categories_list)

    processed_text = f"""
    Kamu adalah mesin validasi dan ekstraksi laporan publik. Tugasmu HANYA mengevaluasi teks laporan yang diberikan dan mengembalikan JSON sesuai format.

    KONTEKS SISTEM:
    Daftar Kategori Resmi: [{existing_categories_str}]

    ATURAN KETAT:
    1. Hanya kembalikan format JSON murni. Jangan tambahkan teks pembuka, penutup, atau formatting Markdown.
    2. `is_valid` = `true` jika berupa aduan/informasi publik yang relevan. `false` jika berupa spam, ketikan acak, atau promosi.
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

    ai_result = self.ai.moderate_and_summarize(processed_text, img_url)

    if not ai_result.get("is_valid", True):
      return {
        "summary_id": None,
        "summary": None,
        "category": None,
        "match_score": None,
        "has_profanity": ai_result.get("has_profanity", False),
        "reason": "Laporan dianggap tidak layak atau spam oleh AI"
      }

    summary_text = ai_result.get("summary") or incoming_text[:100]
    text_vector = self.ai.generate_embedding(summary_text)

    matched_summary = self.summary_repo.find_closest(text_vector, threshold=0.85)

    if matched_summary:
      self.summary_repo.increment_count_and_update_keywords(
        summary_id=matched_summary["id"],
        updated_keywords=list(set(matched_summary["keywords"]).union(ai_result["keywords"]))
      )
      self.report_repo.create(
        raw_text=incoming_text,
        summary_id=matched_summary["id"],
        has_profanity=ai_result["has_profanity"],
        img_url=img_url
      )
      return {
        "summary_id": matched_summary["id"],
        "summary": matched_summary["summary"],
        "category": matched_summary["category"],
        "match_score": matched_summary["match_score"],
        "has_profanity": ai_result["has_profanity"],
        "reason": "Laporan berhasil digabungkan ke klaster yang sudah ada"
      }
    else:
      new_summary_id = self.summary_repo.create(
        summary=ai_result["summary"],
        category=ai_result["category"],
        keywords=ai_result["keywords"],
        embedding=text_vector
      )
      self.report_repo.create(
        raw_text=incoming_text,
        summary_id=new_summary_id,
        has_profanity=ai_result["has_profanity"],
        img_url=img_url
      )
      return {
        "summary_id": new_summary_id,
        "summary": ai_result["summary"],
        "category": ai_result["category"],
        "match_score": 1.0,
        "has_profanity": ai_result["has_profanity"],
        "reason": "Laporan baru berhasil dibuatkan klaster topik"
      }