import sys
from database import get_db_connection

def flush_database():
  conn = get_db_connection()
  print("[*] Memulai pembersihan database...")

  try:
    # Hapus data dari tabel anak (reports) terlebih dahulu untuk menjaga integritas FK
    conn.execute("DELETE FROM reports")
    print("[+] Data tabel 'reports' berhasil dihapus.")

    # Hapus data dari tabel induk (summaries)
    conn.execute("DELETE FROM summaries")
    print("[+] Data tabel 'summaries' berhasil dihapus.")

    # Reset pemetaan auto increment ID jika sqlite_sequence tersedia
    try:
      conn.execute("DELETE FROM sqlite_sequence WHERE name IN ('reports', 'summaries')")
      print("[+] Auto increment ID berhasil di-reset ke 1.")
    except Exception:
      pass

    conn.commit()
    print("[+] Database berhasil dikosongkan.")

  except Exception as e:
    print(f"[!] Gagal membersihkan database: {e}")
    sys.exit(1)

if __name__ == "__main__":
  confirm = input("Peringatan: Seluruh data laporan dan ringkasan akan dihapus. Lanjutkan? (y/N): ")
  if confirm.lower() == 'y':
    flush_database()
  else:
    print("[*] Operasi dibatalkan.")