import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { serialize } from 'cookie';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export async function POST(req: Request) {
  try {
    const { internCode, password } = await req.json();

    if (!internCode || !password) {
      return NextResponse.json({ error: 'Kode Magang dan password wajib diisi.' }, { status: 400 });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: parseInt(internCode) },
    });

    if (!user) {
      return NextResponse.json({ error: 'Kode Magang atau Password salah.' }, { status: 401 });
    }

    const passwordIsValid = await compare(password, user.password);

    if (!passwordIsValid) {
      return NextResponse.json({ error: 'Kode Magang atau Password salah.' }, { status: 401 });
    }

    // 1. Buat token tanpa waktu kedaluwarsa spesifik (opsional, tapi lebih konsisten)
    const token = sign(
      { userId: user.id, name: user.name },
      JWT_SECRET
      // Properti expiresIn dihapus
    );

    // 2. Simpan tiket di browser sebagai session cookie (tanpa maxAge)
    const serializedCookie = serialize('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      // maxAge dihapus agar cookie hilang saat browser ditutup
      path: '/',
    });

    return new NextResponse(JSON.stringify({ message: 'Login berhasil' }), {
      status: 200,
      headers: { 'Set-Cookie': serializedCookie },
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}