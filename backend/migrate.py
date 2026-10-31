from dotenv import load_dotenv
from database import get_db_connection

load_dotenv(".env.development.local")

conn = get_db_connection()

conn.execute("""
  CREATE TABLE IF NOT EXISTS summaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    summary TEXT NOT NULL,
    category TEXT DEFAULT 'Umum',
    keywords TEXT NOT NULL,
    count INTEGER DEFAULT 1,
    status TEXT DEFAULT 'SUBMITTED',
    embedding F32_BLOB,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
""")

conn.execute("""
  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    summary_id INTEGER,
    raw_text TEXT NOT NULL,
    img_url TEXT,
    has_profanity BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(summary_id) REFERENCES summaries(id)
  )
""")

conn.execute("""
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT,
    email TEXT,
    password TEXT
  )
""")

conn.commit()