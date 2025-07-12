import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { serialize } from 'cookie';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    // 1. Cari user berdasarkan NAMA dan pastikan rolenya adalah ADMIN
    const admin = await prisma.user.findFirst({
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

    // 2. Buat token khusus untuk admin
    const token = sign(
      { userId: admin.id, name: admin.name, role: admin.role }, // Simpan role di token
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // 3. Buat cookie dengan nama berbeda, misal 'adminAuthToken'
    const serializedCookie = serialize('adminAuthToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 8,
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