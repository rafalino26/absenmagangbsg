// src/app/api/interns/archived/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { Role } from '@prisma/client';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

async function verifyAdminToken(req: NextRequest) {
  const token = req.cookies.get('adminAuthToken')?.value;
  if (!token) return { error: 'Tidak terautentikasi', status: 401 };
  try {
    const decoded = verify(token, JWT_SECRET) as { userId: number; role: Role };

    // --- PERUBAHAN DI SINI ---
    // Definisikan secara eksplisit peran apa saja yang diizinkan
    const allowedRoles: Role[] = [Role.SUPER_ADMIN, Role.ADMIN, Role.LECTURER];
    
    // Lakukan perbandingan dengan array yang sudah didefinisikan
    if (!allowedRoles.includes(decoded.role)) {
      return { error: 'Akses ditolak', status: 403 };
    }
    // --- SELESAI PERUBAHAN ---

    return { userId: decoded.userId, role: decoded.role };
  } catch (error) {
    return { error: 'Token tidak valid', status: 401 };
  }
}

export async function GET(req: NextRequest) {
  const auth = await verifyAdminToken(req);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    let whereClause: any = {
        role: Role.INTERN,
        isActive: false,
    };

    if (auth.role === Role.ADMIN) {
        whereClause.mentorId = auth.userId;
    } else if (auth.role === Role.LECTURER) {
        whereClause.lecturerId = auth.userId;
    }

    const archivedInterns = await db.user.findMany({
      where: whereClause,
      select: {
        id: true,
        internCode: true,
        name: true,
        // INI BAGIAN PALING PENTING:
        division: {
            select: { name: true }
        },
        university: { // <-- TAMBAHKAN INI
      select: { name: true }
    },
        periodStartDate: true,
        periodEndDate: true,
      },
      orderBy: {
        periodEndDate: 'desc',
      },
    });

    return NextResponse.json(archivedInterns);

  } catch (error) {
    console.error("Error mengambil data arsip:", error);
    return NextResponse.json({ error: 'Gagal mengambil data arsip' }, { status: 500 });
  }
}