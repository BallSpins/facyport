import asyncio
import time
import statistics
import httpx

# Endpoint target
SYNC_URL = "https://facyport-backend-nine.vercel.app/api/reports-sync"   # Endpoint lama
ASYNC_URL = "https://facyport-backend-nine.vercel.app/api/reports"       # Endpoint QStash

TOTAL_REQUESTS = 30  # Jumlah lonjakan request

async def send_single_request(client: httpx.AsyncClient, url: str, req_id: int):
    start = time.perf_counter()
    data = {"raw_text": f"[BENCHMARK #{req_id}] Tes fasilitas kelas dan proyektor rusak."}
    
    try:
        res = await client.post(url, data=data, timeout=30.0)
        elapsed = (time.perf_counter() - start) * 1000  # Konversi ke ms
        return {
            "id": req_id,
            "status": res.status_code,
            "latency_ms": elapsed,
            "success": res.status_code in (201, 202)
        }
    except Exception as e:
        elapsed = (time.perf_counter() - start) * 1000
        return {
            "id": req_id,
            "status": "TIMEOUT/ERROR",
            "latency_ms": elapsed,
            "success": False
        }

async def run_benchmark(target_url: str, label: str):
    print(f"\n==================================================")
    print(f"[*] MEMULAI BENCHMARK: {label}")
    print(f"[*] Target URL: {target_url}")
    print(f"[*] Jumlah Request: {TOTAL_REQUESTS} concurrent requests")
    print(f"==================================================")

    start_total = time.perf_counter()
    async with httpx.AsyncClient() as client:
        tasks = [send_single_request(client, target_url, i) for i in range(1, TOTAL_REQUESTS + 1)]
        results = await asyncio.gather(*tasks)
    
    total_time = time.perf_counter() - start_total

    # Kalkulasi Metrik
    latencies = [r["latency_ms"] for r in results]
    status_counts = {}
    for r in results:
        status_counts[r["status"]] = status_counts.get(r["status"], 0) + 1

    avg_latency = statistics.mean(latencies)
    p95_latency = statistics.quantiles(latencies, n=20)[18]  # Percentile 95
    min_latency = min(latencies)
    max_latency = max(latencies)
    rps = TOTAL_REQUESTS / total_time

    print(f"\n--- HASIL METRIK METRIK [{label}] ---")
    print(f"Total Waktu Pengujian : {total_time:.2f} detik")
    print(f"Throughput (RPS)       : {rps:.2f} request/detik")
    print(f"Status Code Summary   : {status_counts}")
    print(f"Min Latency           : {min_latency:.2f} ms")
    print(f"Average Latency       : {avg_latency:.2f} ms")
    print(f"P95 Latency           : {p95_latency:.2f} ms")
    print(f"Max Latency           : {max_latency:.2f} ms")

if __name__ == "__main__":
    # Jalankan benchmark pada endpoint QStash
    asyncio.run(run_benchmark(ASYNC_URL, "DENGAN QSTASH (ASYNC QUEUE)"))