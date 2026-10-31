class ReportRepository:
  def __init__(self, db_conn):
    self.conn = db_conn

  def create(self, raw_text: str, summary_id: int, has_profanity: bool, img_url: str = None) -> int:
    cursor = self.conn.execute(
      "INSERT INTO reports (raw_text, img_url, summary_id, has_profanity) VALUES (?, ?, ?, ?) RETURNING id",
      (raw_text, img_url, summary_id, has_profanity)
    )
    self.conn.commit()
    return cursor.fetchone()[0]

  def get_by_summary_id(self, summary_id: int) -> list[dict]:
    cursor = self.conn.execute(
      "SELECT id, summary_id, raw_text, img_url, has_profanity, created_at FROM reports WHERE summary_id = ?",
      (summary_id,)
    )
    rows = cursor.fetchall()
    return [
      {
        "id": r[0],
        "summary_id": r[1],
        "raw_text": r[2],
        "img_url": r[3],
        "has_profanity": bool(r[4]),
        "created_at": str(r[5]),
      }
      for r in rows
    ]

  def get_by_id(self, report_id: int):
    cursor = self.conn.execute(
      "SELECT id, summary_id, raw_text, img_url, has_profanity, created_at FROM reports WHERE id = ?",
      (report_id,)
    )
    row = cursor.fetchone()
    if row:
      return {
        "id": row[0],
        "summary_id": row[1],
        "raw_text": row[2],
        "img_url": row[3],
        "has_profanity": bool(row[4]),
        "created_at": str(row[5]) if row[5] else None
      }
    return None

  def increment_count(self, report_id: int):
    self.conn.execute(
      "UPDATE reports SET count = count + 1 WHERE id = ?",
      (report_id,)
    )
    self.conn.commit()