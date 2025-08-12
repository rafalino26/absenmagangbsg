// src/app/api/logs/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { Role } from '@prisma/client';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('adminAuthToken')?.value;
    if (!token) return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    const decoded = verify(token, JWT_SECRET) as { userId: number; role: Role };

    let whereClause: any = {
        // Nanti bisa ditambahkan filter status, tanggal, dll.
    };

    // Jika yang login adalah Mentor, filter hanya untuk peserta bimbingannya
    if (decoded.role === Role.ADMIN) {
      whereClause.user = { mentorId: decoded.userId };
    }

    const logs = await db.dailyLog.findMany({
      where: whereClause,
      include: {
        user: { // Ambil nama peserta untuk ditampilkan
          select: { name: true, division: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(logs);

  } catch (error) {
    console.error("[GET LOGS ERROR]", error);
    return NextResponse.json({ error: 'Gagal mengambil data log' }, { status: 500 });
  }
}