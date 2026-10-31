import os
import json
from qstash import QStash

class QStashService:
  def __init__(self):
    self.token = os.getenv("QSTASH_TOKEN")
    self.app_base_url = os.getenv("APP_BASE_URL", "").rstrip("/")
    
    if not self.token:
      raise ValueError("QSTASH_TOKEN belum dikonfigurasi di file .env")
        
    self.client = QStash(token=self.token)

  def enqueue_report(self, payload: dict) -> dict:
    """Memasukkan payload laporan ke antrean QStash dengan pembatasan Flow Control."""
    worker_url = f"{self.app_base_url}/api/worker/process-report"
    
    res = self.client.message.enqueue(
      queue="gemini-queue",
      url=worker_url,
      body=json.dumps(payload),
      headers={
        "Content-Type": "application/json",
        "Upstash-Flow-Control-Key": "gemini-rate-limit"
      }
    )
    return res