// app/api/admin/universities/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { verify } from 'jsonwebtoken';
import { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

async function verifySuperAdmin(req: NextRequest) {
  const token = req.cookies.get('adminAuthToken')?.value;
  if (!token) return { error: 'Tidak terautentikasi', status: 401 };
  try {
    const decoded = verify(token, JWT_SECRET) as { userId: number; role: Role };
    if (decoded.role !== Role.SUPER_ADMIN) {
      return { error: 'Akses ditolak.', status: 403 };
    }
    return { userId: decoded.userId };
  } catch (error) {
    return { error: 'Token tidak valid', status: 401 };
  }
}

// Mengambil daftar semua universitas
export async function GET(req: NextRequest) {
  try {
    const universities = await db.university.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json(universities);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memuat universitas' }, { status: 500 });
  }
}

// Membuat universitas baru
export async function POST(req: NextRequest) {
  const auth = await verifySuperAdmin(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { name } = await req.json();
    const newUniversity = await db.university.create({ data: { name } });
    return NextResponse.json(newUniversity, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal membuat universitas' }, { status: 500 });
  }
}