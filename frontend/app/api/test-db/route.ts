import { NextResponse } from 'next/server';
import { turso } from '@/lib/turso';

export async function GET() {
  try {
    // Jalankan query sederhana untuk cek koneksi
    const result = await turso.execute('SELECT 1 as connected;');
    return NextResponse.json({
      success: true,
      message: 'Koneksi ke Turso DB Berhasil! 🚀',
      data: result.rows,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal konek ke Turso DB',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

