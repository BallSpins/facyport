import { NextResponse } from 'next/server';
import { turso } from '@/lib/turso';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    // 1. Buat tabel users (hanya id, username, email, password)
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );
    `);

    // 2. Cek apakah admin default sudah ada
    const existing = await turso.execute({
      sql: 'SELECT id FROM users WHERE username = ? OR email = ?',
      args: ['admin', 'admin@facyport.com'],
    });

    if (existing.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await turso.execute({
        sql: 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        args: ['admin', 'admin@facyport.com', hashedPassword],
      });
      return NextResponse.json({
        success: true,
        message: 'Tabel users dibuat & akun admin default berhasil di-seed!',
        account: {
          username: 'admin',
          email: 'admin@facyport.com',
          password: 'admin123',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Tabel users sudah siap.',
      account: {
        username: 'admin',
        email: 'admin@facyport.com',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal inisialisasi tabel users',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
