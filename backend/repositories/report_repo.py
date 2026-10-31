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

  def get_by_id(self, report_id: int):
    cursor = self.conn.execute(
      "SELECT id, raw_text, img_url, has_profanity FROM reports WHERE id = ?",
      (report_id,)
    )
    row = cursor.fetchone()
    if row:
      return {"id": row[0], "raw_text": row[1], "img_url": row[2], "count": row[3]}
    return None

  def increment_count(self, report_id: int):
    self.conn.execute(
      "UPDATE reports SET count = count + 1 WHERE id = ?",
      (report_id,)
    )
    self.conn.commit()