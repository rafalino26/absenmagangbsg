import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Ambil semua data absensi, tapi hanya kolom timestamp
    const attendances = await prisma.attendance.findMany({
      select: {
        timestamp: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    // Proses untuk mendapatkan daftar bulan unik
    const monthYearSet = new Set<string>();
    attendances.forEach(att => {
      const date = new Date(att.timestamp);
      const monthYear = date.toLocaleDateString('id-ID', {
        month: 'long',
        year: 'numeric'
      });
      monthYearSet.add(monthYear);
    });

    const uniqueMonths = Array.from(monthYearSet);

    return NextResponse.json(uniqueMonths);

  } catch (error) {
    console.error("Error mengambil daftar bulan:", error);
    return NextResponse.json({ error: 'Gagal mengambil daftar bulan' }, { status: 500 });
  }
}