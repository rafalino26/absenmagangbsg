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

export async function GET(req: NextRequest) {
  // API ini tidak perlu diamankan karena semua admin perlu melihat daftar divisi
  try {
    const divisions = await db.division.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json(divisions);
  } catch (error) { /* ... */ }
}

export async function POST(req: NextRequest) {
  const auth = await verifySuperAdmin(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { name } = await req.json();
    const newDivision = await db.division.create({ data: { name } });
    return NextResponse.json(newDivision, { status: 201 });
  } catch (error) { /* ... */ }
}