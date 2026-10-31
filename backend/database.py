import os
import atexit
import threading
import turso_serverless
from dotenv import load_dotenv

load_dotenv(".env.development.local")

_db_connection = None
_db_lock = threading.Lock()

def _close_db_connection():
  global _db_connection
  if _db_connection is not None:
    try:
      _db_connection.close()
      print(" [i] Connection closed.")
    except Exception:
      pass
    _db_connection = None

def get_db_connection():
  global _db_connection
  if _db_connection is None:
    with _db_lock:

      if _db_connection is None:
        _db_connection = turso_serverless.connect(
          os.environ["TURSO_DATABASE_URL"],
          auth_token=os.environ["TURSO_AUTH_TOKEN"],
        )

  return _db_connection

atexit.register(_close_db_connection)