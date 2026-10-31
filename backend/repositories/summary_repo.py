import json
from typing import Optional
from enums import SummaryStatus

class SummaryRepository:
  def __init__(self, db_conn):
    self.conn = db_conn

  def create(self, summary: str, category: str, keywords: list[str], embedding: list[float]) -> int:
    keywords_json = json.dumps(keywords)
    embedding_json = json.dumps(embedding)

    cursor = self.conn.execute(
      """
      INSERT INTO summaries (summary, category, keywords, count, status, embedding)
      VALUES (?, ?, ?, 1, ?, vector32(?))
      RETURNING id
      """,
      (summary, category, keywords_json, SummaryStatus.SUBMITTED, embedding_json)
    )
    self.conn.commit()
    return cursor.fetchone()[0]

  def find_closest(self, query_embedding: list[float], threshold: float = 0.85) -> Optional[dict]:
    embedding_json = json.dumps(query_embedding)

    # Hitung cosine distance antara query_embedding dengan embedding di DB
    cursor = self.conn.execute(
      """
      SELECT 
        id, summary, category, keywords, count, status, created_at,
        vector_distance_cos(embedding, vector32(?)) AS distance
      FROM summaries
      WHERE embedding IS NOT NULL AND status != 'RESOLVED'
      ORDER BY distance ASC
      LIMIT 1
      """,
      (embedding_json,)
    )
        
    row = cursor.fetchone()
    if not row:
      return None

    distance = row[7]
    similarity_score = round(1.0 - distance, 4)

    # Jika tingkat kemiripan memenuhi ambang batas (threshold)
    if similarity_score >= threshold:
      return {
        "id": row[0],
        "summary": row[1],
        "category": row[2],
        "keywords": json.loads(row[3]) if row[3] else [],
        "count": row[4],
        "status": row[5],
        "created_at": row[6],
        "match_score": similarity_score
      }
        
    return None

  def get_all(self) -> list[dict]:
    cursor = self.conn.execute(
      "SELECT id, summary, category, keywords, count, status, created_at FROM summaries ORDER BY id DESC"
    )
    rows = cursor.fetchall()
    result = []
    for row in rows:
      result.append({
        "id": row[0],
        "summary": row[1],
        "category": row[2],
        "keywords": json.loads(row[3]) if row[3] else [],
        "count": row[4],
        "status": row[5],
        "created_at": row[6]
      })
    return result

  def get_by_id(self, summary_id: int) -> Optional[dict]:
    cursor = self.conn.execute(
      "SELECT id, summary, category, keywords, count, status, created_at FROM summaries WHERE id = ?",
      (summary_id,)
    )
    row = cursor.fetchone()
    if not row:
      return None
    return {
      "id": row[0],
      "summary": row[1],
      "category": row[2],
      "keywords": json.loads(row[3]) if row[3] else [],
      "count": row[4],
      "status": row[5],
      "created_at": row[6]
    }

  def increment_count_and_update_keywords(self, summary_id: int, updated_keywords: list[str]):
    keywords_json = json.dumps(updated_keywords)
    self.conn.execute(
      "UPDATE summaries SET count = count + 1, keywords = ? WHERE id = ?",
      (keywords_json, summary_id)
    )
    self.conn.commit()

  def update_status(self, summary_id: int, status: SummaryStatus):
    self.conn.execute(
      "UPDATE summaries SET status = ? WHERE id = ?",
      (status, summary_id)
    )
    self.conn.commit()

  def get_all_categories(self) -> list[str]:
    cursor = self.conn.execute(
      """
      SELECT DISTINCT category 
      FROM summaries 
      WHERE category IS NOT NULL AND category != '' 
      ORDER BY category ASC
      """
    )
    rows = cursor.fetchall()
    return [row[0] for row in rows]