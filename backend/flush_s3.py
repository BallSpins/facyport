import os
import sys
import boto3
from botocore.config import Config
from dotenv import load_dotenv

load_dotenv(".env.development.local")

def flush_s3():
  account_id = os.getenv("CF_ACCOUNT_ID")
  access_key = os.getenv("CF_R2_ACCESS_KEY_ID")
  secret_key = os.getenv("CF_R2_SECRET_ACCESS_KEY")
  bucket_name = os.getenv("CF_R2_BUCKET_NAME")

  if not all([account_id, access_key, secret_key, bucket_name]):
    print("[!] Konfigurasi Cloudflare R2 di .env.development.local belum lengkap.")
    sys.exit(1)

  print(f"[*] Memulai pembersihan Cloudflare R2 (Bucket: {bucket_name})...")

  try:
    s3_client = boto3.client(
      service_name="s3",
      endpoint_url=f"https://{account_id}.r2.cloudflarestorage.com",
      aws_access_key_id=access_key,
      aws_secret_access_key=secret_key,
      config=Config(signature_version="s3v4"),
    )

    paginator = s3_client.get_paginator("list_objects_v2")
    deleted_count = 0

    for page in paginator.paginate(Bucket=bucket_name):
      if "Contents" in page:
        objects_to_delete = [{"Key": obj["Key"]} for obj in page["Contents"]]
        if objects_to_delete:
          response = s3_client.delete_objects(
            Bucket=bucket_name,
            Delete={"Objects": objects_to_delete}
          )
          count = len(response.get("Deleted", []))
          deleted_count += count

    if deleted_count == 0:
      print("[*] Bucket Cloudflare R2 sudah dalam keadaan kosong.")
    else:
      print(f"[+] Total {deleted_count} berkas di Cloudflare R2 berhasil dihapus.")

  except Exception as e:
    print(f"[!] Gagal membersihkan Cloudflare R2: {e}")
    sys.exit(1)

if __name__ == "__main__":
  confirm = input("Peringatan: Seluruh berkas di Cloudflare R2 akan dihapus. Lanjutkan? (y/N): ")
  if confirm.lower() == 'y':
    flush_s3()
  else:
    print("[*] Operasi dibatalkan.")