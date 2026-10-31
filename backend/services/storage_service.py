import os
import uuid
import boto3
from botocore.config import Config

class StorageService:
  def __init__(self):
    self.account_id = os.getenv("CF_ACCOUNT_ID")
    self.access_key = os.getenv("CF_R2_ACCESS_KEY_ID")
    self.secret_key = os.getenv("CF_R2_SECRET_ACCESS_KEY")
    self.bucket_name = os.getenv("CF_R2_BUCKET_NAME")

    self.s3_client = boto3.client(
      service_name="s3",
      endpoint_url=f"https://{self.account_id}.r2.cloudflarestorage.com",
      aws_access_key_id=self.access_key,
      aws_secret_access_key=self.secret_key,
      config=Config(signature_version="s3v4"),
    )

  def upload_private_file(self, file_bytes: bytes, content_type: str = "image/jpeg") -> str:
    """Mengunggah file ke Private R2 dan mengembalikan Object Key/Path-nya."""
    ext_map = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}
    ext = ext_map.get(content_type, "jpg")
    object_key = f"reports/{uuid.uuid4().hex}.{ext}"

    self.s3_client.put_object(
      Bucket=self.bucket_name,
      Key=object_key,
      Body=file_bytes,
      ContentType=content_type,
    )

    return object_key

  def get_presigned_url(self, object_key: str, expires_in: int = 3600) -> str:
    """Menghasilkan URL terenkripsi yang hanya berlaku sementara (default: 1 jam)."""
    if not object_key:
      return ""
            
    return self.s3_client.generate_presigned_url(
      ClientMethod="get_object",
      Params={"Bucket": self.bucket_name, "Key": object_key},
      ExpiresIn=expires_in,
    )