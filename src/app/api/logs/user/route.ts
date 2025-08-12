// src/app/api/logs/user/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { verify } from 'jsonwebtoken';
import { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// FUNGSI UNTUK MENGAMBIL LOG MILIK USER SENDIRI (GET)
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('authToken')?.value;
    if (!token) return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    const decoded = verify(token, JWT_SECRET) as { userId: number };
    
    const logs = await db.dailyLog.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' },
      take: 30, // Ambil 30 log terakhir saja agar tidak berat
    });
    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data log' }, { status: 500 });
  }
}

// FUNGSI UNTUK MENGIRIM LOG BARU (POST)
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('authToken')?.value;
    if (!token) return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    const decoded = verify(token, JWT_SECRET) as { userId: number };
    
    const { activities, otherActivity } = await req.json();

    let finalActivity = activities.join(', ');
    if (otherActivity) {
      finalActivity += `, ${otherActivity}`;
    }

    if (!finalActivity) {
      return NextResponse.json({ error: 'Aktivitas tidak boleh kosong' }, { status: 400 });
    }

    const newLog = await db.dailyLog.create({
      data: {
        userId: decoded.userId,
        activity: finalActivity,
      },
    });

    return NextResponse.json(newLog, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan log' }, { status: 500 });
  }
}