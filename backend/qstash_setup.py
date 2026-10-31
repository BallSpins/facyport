import os
from dotenv import load_dotenv
from qstash import QStash

load_dotenv(".env.development.local")

token = os.getenv("QSTASH_TOKEN")
if not token:
    print("[!] QSTASH_TOKEN tidak ditemukan.")
    exit(1)

client = QStash(token=token)

print("[*] Mengunci konfigurasi Flow Control 'gemini-rate-limit'...")

# Pin konfigurasi: Maksimal 1 request bersamaan (parallelism=1), 15 request per 60 detik (15 RPM)
client.flow_control.pin(
    "gemini-rate-limit",
    {"parallelism": 1, "rate": 15, "period": 60}
)

print("[+] Konfigurasi berhasil di-pin: 15 RPM / 1 Parallel Worker.")