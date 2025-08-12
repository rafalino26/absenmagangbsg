// src/app/api/admin/activities/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { Role } from '@prisma/client';
import { verify } from 'jsonwebtoken';

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

export async function GET(req: NextRequest) {
  try {
    const activities = await db.predefinedActivity.findMany({
      orderBy: { task: 'asc' },
    });
    return NextResponse.json(activities);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data aktivitas' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await verifySuperAdmin(req);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    const { task } = await req.json();
    if (!task) {
      return NextResponse.json({ error: 'Nama tugas wajib diisi' }, { status: 400 });
    }
    const newActivity = await db.predefinedActivity.create({
      data: { task },
    });
    return NextResponse.json(newActivity, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Aktivitas dengan nama ini sudah ada.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Gagal menambah aktivitas baru' }, { status: 500 });
  }
}