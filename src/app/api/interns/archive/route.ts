// src/app/api/interns/archive/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db'; // Menggunakan koneksi Prisma yang sudah ada

export async function GET(req: NextRequest) {
  // Pengaman agar hanya cron job yang bisa mengakses
//   const secret = req.nextUrl.searchParams.get('secret');
//   if (secret !== process.env.CRON_SECRET) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Set ke awal hari UTC agar perbandingan akurat

    const internsToArchive = await db.user.findMany({
      where: {
        role: 'INTERN',
        isActive: true,
        periodEndDate: {
          lt: today, // Kurang dari awal hari ini (kemarin atau sebelumnya)
        },
      },
      select: { id: true }
    });

    if (internsToArchive.length === 0) {
      return NextResponse.json({ message: 'Tidak ada peserta yang perlu diarsipkan.' });
    }

    const idsToArchive = internsToArchive.map(intern => intern.id);

    // Update status mereka menjadi tidak aktif
    const result = await db.user.updateMany({
      where: {
        id: { in: idsToArchive },
      },
      data: {
        isActive: false,
      },
    });

    return NextResponse.json({
      message: `${result.count} peserta berhasil diarsipkan.`,
    });
  } catch (error: any) {
    console.error('[ARSIP PESERTA ERROR]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}