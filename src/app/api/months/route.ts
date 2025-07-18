import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const attendances = await db.attendance.findMany({ 
      select: {
        timestamp: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    const monthYearSet = new Set<string>();
    
    attendances.forEach((att: { timestamp: Date }) => {
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