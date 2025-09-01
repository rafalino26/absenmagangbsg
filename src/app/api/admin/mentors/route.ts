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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const divisionId = searchParams.get('divisionId');

  let whereClause: any = {
    role: { in: [Role.ADMIN, Role.LECTURER] }
  };

  // Jika ada filter divisionId, tambahkan ke query
  if (divisionId) {
    whereClause.divisionId = parseInt(divisionId);
  }

  try {
    const users = await db.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        role: true,
        division: { select: { id: true, name: true } },
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('[GET MENTORS/LECTURERS ERROR]', error);
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}

// FUNGSI UNTUK MEMBUAT MENTOR BARU (POST)
export async function POST(req: NextRequest) {
  const auth = await verifySuperAdmin(req);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
   const { name, division, password, role } = await req.json();

    if (!name || !division || !password || !role) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    if (role !== Role.ADMIN && role !== Role.LECTURER) {
    return NextResponse.json({ error: 'Role tidak valid' }, { status: 400 });
}

    const hashedPassword = await hash(password, 10);

    const newMentor = await db.user.create({
      data: {
        name,
        division,
        password: hashedPassword,
        role: role, // Set role sebagai ADMIN (Mentor)
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