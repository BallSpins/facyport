from typing import Optional
from pydantic import BaseModel, Field
from enums import SummaryStatus

# --- Summary Models ---
class SummaryBase(BaseModel):
  summary: str
  category: str = "Umum"
  keywords: list[str] = Field(default_factory=list)
  status: SummaryStatus = SummaryStatus.SUBMITTED

class SummaryCreate(SummaryBase):
  pass

class SummaryResponse(SummaryBase):
  id: int
  count: int
  created_at: Optional[str] = None

class SummaryUpdateStatus(BaseModel):
  status: SummaryStatus

# --- Report Models ---
class ReportCreate(BaseModel):
  raw_text: str
  img_url: str

class ReportResponse(BaseModel):
  id: int
  summary_id: int
  raw_text: str
  img_url: Optional[str] = None
  has_profanity: bool
  created_at: Optional[str] = None

class ReportProcessResult(BaseModel):
  summary_id: Optional[int] = None
  summary: Optional[str] = None
  category: Optional[str] = None
  match_score: Optional[float] = None
  has_profanity: bool = False
  reason: Optional[str] = None

class AIResult(BaseModel):
    is_valid: bool = Field(description="true jika laporan/aduan publik relevan dan bernilai nyata. false jika spam, ketikan acak, promosi, atau gambar rusak.")
    has_profanity: bool = Field(description="true jika teks mengandung kata kotor, makian, atau jika gambar menunjukkan konten yang tidak pantas/kasar.")
    category: str = Field(description="Kategori aduan. Wajib pilih SATU dari daftar kategori resmi yang diberikan.")
    summary: Optional[str] = Field(None, description="Ringkasan aduan dalam 1 kalimat padat (8-10 kata). Isi null jika is_valid = false.")
    keywords: List[str] = Field(default_factory=list, description="3-6 kata kunci utama dalam lowercase.")