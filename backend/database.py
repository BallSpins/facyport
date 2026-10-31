import os
import turso_serverless
from dotenv import load_dotenv

load_dotenv(".env.development.local")

def get_db_connection():
  """
  Mengembalikan koneksi Turso DB baru per-request.
  """
  return turso_serverless.connect(
    os.environ["TURSO_DATABASE_URL"],
    auth_token=os.environ["TURSO_AUTH_TOKEN"],
  )