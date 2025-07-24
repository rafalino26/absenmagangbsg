import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { serialize } from 'cookie';
import { db } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
        return NextResponse.json({ error: 'Username dan password wajib diisi.' }, { status: 400 });
    }
    const admin = await db.user.findFirst({
      where: {
        name: username,
        role: 'ADMIN',
      },
    });

    if (!admin) {
      return NextResponse.json({ error: 'Akun admin tidak ditemukan.' }, { status: 401 });
    }

    const passwordIsValid = await compare(password, admin.password);
    if (!passwordIsValid) {
      return NextResponse.json({ error: 'Password salah.' }, { status: 401 });
    }

    const token = sign(
      { userId: admin.id, name: admin.name, role: admin.role }, 
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const serializedCookie = serialize('adminAuthToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1,
      path: '/',
    });

    return new NextResponse(JSON.stringify({ message: 'Login admin berhasil' }), {
      status: 200,
      headers: { 'Set-Cookie': serializedCookie },
    });

  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}