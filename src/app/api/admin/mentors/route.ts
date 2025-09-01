// src/app/api/admin/mentors/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { Role } from '@prisma/client';
import { verify } from 'jsonwebtoken';
import { hash } from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// Fungsi untuk verifikasi token dan role SUPER_ADMIN (tidak perlu diubah)
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
    return { userId: decoded.userId };
  } catch (error) {
    return { error: 'Token tidak valid', status: 401 };
  }
}

/**
 * FUNGSI GET: Mengambil daftar SEMUA Mentor (ADMIN) dan Dosen (LECTURER)
 */
export async function GET(req: NextRequest) {
  try {
    const users = await db.user.findMany({
      // 1. Ambil semua user dengan peran ADMIN atau LECTURER
      where: {
        OR: [
          { role: Role.ADMIN },
          { role: Role.LECTURER }
        ]
      },
      // 2. Sertakan data relasi untuk division DAN university
      select: {
        id: true,
        name: true,
        role: true,
        division: {
          select: {
            id: true,
            name: true
          }
        },
        university: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('[GET MENTORS/LECTURERS ERROR]', error);
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}

/**
 * FUNGSI POST: Membuat akun baru untuk Mentor ATAU Dosen
 */
export async function POST(req: NextRequest) {
  const auth = await verifySuperAdmin(req);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    // 1. Ambil data baru, termasuk divisionId dan universityId
    const { name, password, role, divisionId, universityId } = await req.json();

    if (!name || !password || !role) {
      return NextResponse.json({ error: 'Nama, password, dan role wajib diisi.' }, { status: 400 });
    }
    if (role !== Role.ADMIN && role !== Role.LECTURER) {
      return NextResponse.json({ error: 'Role tidak valid. Harus ADMIN atau LECTURER.' }, { status: 400 });
    }

    const hashedPassword = await hash(password, 10);
    
    // 2. Siapkan data untuk disimpan ke database secara dinamis
    const dataToCreate: any = {
      name,
      password: hashedPassword,
      role,
    };

    if (role === Role.ADMIN) {
      if (!divisionId) {
        return NextResponse.json({ error: 'Mentor harus memiliki divisi.' }, { status: 400 });
      }
      dataToCreate.divisionId = divisionId;
    } else if (role === Role.LECTURER) {
      if (!universityId) {
        return NextResponse.json({ error: 'Dosen harus memiliki universitas.' }, { status: 400 });
      }
      dataToCreate.universityId = universityId;
    }

    const newUser = await db.user.create({
      data: dataToCreate,
    });
    
    // Jangan kirim password kembali ke client
    const { password: _, ...userData } = newUser;

    return NextResponse.json(userData, { status: 201 });
  } catch (error: any) {
    console.error('[CREATE USER ERROR]', error);
    return NextResponse.json({ error: 'Gagal membuat akun baru.' }, { status: 500 });
  }
}