import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { serialize } from 'cookie';
import { db } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export async function POST(req: Request) {
  try {
    const { internCode, password } = await req.json();

    if (!internCode || !password) {
      return NextResponse.json({ error: 'Kode Magang dan password wajib diisi.' }, { status: 400 });
    }
    
    const internId = parseInt(internCode, 10);
    if (isNaN(internId)) {
      return NextResponse.json({ error: 'Format Kode Magang tidak valid.' }, { status: 400 });
    }
    
    const user = await db.user.findFirst({
      where: { 
        id: internId,
        isActive: true,
      }, 
    });

    if (!user) {
      return NextResponse.json({ error: 'Kode Magang atau Password salah.' }, { status: 401 });
    }

    const passwordIsValid = await compare(password, user.password);

    if (!passwordIsValid) {
      return NextResponse.json({ error: 'Kode Magang atau Password salah.' }, { status: 401 });
    }
    
    const token = sign(
      { userId: user.id, name: user.name },
      JWT_SECRET
    );

    const serializedCookie = serialize('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1,
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