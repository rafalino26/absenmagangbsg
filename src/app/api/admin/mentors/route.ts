// src/app/api/admin/mentors/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { Role } from '@prisma/client';
import { verify } from 'jsonwebtoken';
import { hash } from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// Fungsi untuk verifikasi token dan role SUPER_ADMIN
async function verifySuperAdmin(req: NextRequest) {
  const token = req.cookies.get('adminAuthToken')?.value;
  if (!token) {
    return { error: 'Tidak terautentikasi', status: 401 };
  }
  try {
    const decoded = verify(token, JWT_SECRET) as { userId: number; role: Role };
    if (decoded.role !== Role.SUPER_ADMIN) {
      return { error: 'Akses ditolak', status: 403 };
    }
    return { userId: decoded.userId }; // Sukses
  } catch (error) {
    return { error: 'Token tidak valid', status: 401 };
  }
}

// FUNGSI UNTUK MENGAMBIL DAFTAR SEMUA MENTOR (GET)
export async function GET(req: NextRequest) {
  const auth = await verifySuperAdmin(req);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const mentors = await db.user.findMany({
      where: {
        role: Role.ADMIN,
      },
      select: { // Pilih hanya data yang aman untuk ditampilkan
        id: true,
        name: true,
        email: true,
        division: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(mentors);
  } catch (error) {
    console.error('[GET MENTORS ERROR]', error);
    return NextResponse.json({ error: 'Gagal mengambil data mentor' }, { status: 500 });
  }
}

// FUNGSI UNTUK MEMBUAT MENTOR BARU (POST)
export async function POST(req: NextRequest) {
  const auth = await verifySuperAdmin(req);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { name, division, password } = await req.json();

    if (!name || !division || !password) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    const hashedPassword = await hash(password, 10);

    const newMentor = await db.user.create({
      data: {
        name,
        division,
        password: hashedPassword,
        role: Role.ADMIN, // Set role sebagai ADMIN (Mentor)
      },
    });
    
    // Jangan kirim password kembali ke client
    const { password: _, ...mentorData } = newMentor;

    return NextResponse.json(mentorData, { status: 201 });
  } catch (error: any) {
    // Handle error jika email sudah ada
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Email ini sudah terdaftar.' }, { status: 409 });
    }
    console.error('[CREATE MENTOR ERROR]', error);
    return NextResponse.json({ error: 'Gagal membuat mentor baru' }, { status: 500 });
  }
}