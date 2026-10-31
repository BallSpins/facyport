import io
import time
from google import genai
from google.genai import types
from PIL import Image
from pydantic import BaseModel, Field
from typing import Optional, List, Any
from google.genai.errors import APIError

class AIResult(BaseModel):
  is_valid: bool
  has_profanity: bool
  category: str
  summary: Optional[str] = None
  keywords: List[str] = []

class AIService:
  def __init__(self, api_key: str):
    self.api_key = api_key
    self.client = genai.Client(api_key=self.api_key, http_options=types.HttpOptions(api_version="v1"))

  def _resize_image(self, img_bytes: bytes) -> Image.Image:
        """Kecilkan resolusi gambar untuk mempercepat transfer payload ke AI."""
        img = Image.open(io.BytesIO(img_bytes))
        img.thumbnail((512, 512))
        return img

  def moderate_and_summarize(self, prompt: str, img_bytes: Optional[bytes]) -> dict:
    """
    Mengevaluasi teks & gambar aduan menggunakan gemini-3.5-flash-lite.
    Mengembalikan Python dict yang strukturnya divalidasi oleh Pydantic.
    """

    contents: list[Any] = [prompt]

    if img_bytes:
      try:
        image = self._resize_image(img_bytes)
        contents.append(image)
        print("[+] Gambar in-memory berhasil dimuat ke prompt AI.")
      except Exception as e:
        print(f"[!] Gagal mengolah bytes gambar untuk AI: {e}")

    # Panggil API
    max_retries = 3
    for attempt in range(max_retries):
      try:
        response = self.client.models.generate_content(
          model="gemini-3.5-flash-lite",
          contents=contents,
          config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=AIResult,
            temperature=0.1, 
            max_output_tokens=300
          ),
        )

        if response.parsed is not None:
          if isinstance(response.parsed, BaseModel):
            return response.parsed.model_dump()
          if isinstance(response.parsed, dict):
            return response.parsed
        break
          
      except APIError as e:
        print(f"[!] Gemini API Busy/Error (Attempt {attempt + 1}/{max_retries}): {e.message}")
        if attempt < max_retries - 1:
            time.sleep(2) # Jeda 2 detik sebelum coba lagi
        else:
            print("[X] Mencapai batas retry. Menggunakan fallback response.")
    
    return {
      "is_valid": True,
      "has_profanity": True,
      "category": "",
      "summary": "",
      "keywords": []
    }

  def generate_embedding(self, text: str) -> list[float]:
    """Menghasilkan vector embedding untuk semantic matching."""
    # Panggil API Embedding
    response = self.client.models.embed_content(
      model="gemini-embedding-001",
      contents=text,
      config=types.EmbedContentConfig(
        output_dimensionality=768
      ),
    )

    if not response.embeddings or response.embeddings[0].values is None:
      raise ValueError("Gagal menghasilkan embedding: Respon dari Gemini API kosong.")

    return list(response.embeddings[0].values)