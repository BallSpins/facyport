import { NextResponse } from 'next/server';
import { turso } from '@/lib/turso';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { usernameOrEmail, password } = await request.json();

    if (!usernameOrEmail || !password) {
      return NextResponse.json(
        { success: false, message: 'Username/Email dan password wajib diisi' },
        { status: 400 }
      );
    }

    const identifier = String(usernameOrEmail).trim().toLowerCase();

    // Cari user berdasarkan username ATAU email
    const result = await turso.execute({
      sql: 'SELECT * FROM users WHERE LOWER(username) = ? OR LOWER(email) = ? LIMIT 1',
      args: [identifier, identifier],
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Akun tidak ditemukan atau password salah' },
        { status: 401 }
      );
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, String(user.password));

    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, message: 'Akun tidak ditemukan atau password salah' },
        { status: 401 }
      );
    }

    // Buat JWT token dengan id, username, email
    const token = await signToken({
      id: Number(user.id),
      username: String(user.username),
      email: String(user.email),
    });

    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil!',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });

    // Simpan token di Cookie HTTP-Only
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 hari
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server', error: error.message },
      { status: 500 }
    );
  }
}
