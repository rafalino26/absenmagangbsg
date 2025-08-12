// src/app/api/logs/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { LogStatus } from '@prisma/client';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Di sini bisa ditambahkan verifikasi token mentor/superadmin jika perlu

    const id = parseInt(params.id);
    const { status, notes } = await req.json();

    // Validasi status yang masuk
    if (!Object.values(LogStatus).includes(status)) {
        return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 });
    }

    const updatedLog = await db.dailyLog.update({
      where: { id },
      data: {
        status,
        notes: status === LogStatus.REJECTED ? notes : null, // Hanya simpan notes jika ditolak
      },
    });

    return NextResponse.json(updatedLog);
  } catch (error) {
    console.error(`[UPDATE LOG ${params.id} ERROR]`, error);
    return NextResponse.json({ error: 'Gagal memperbarui status log' }, { status: 500 });
  }
}