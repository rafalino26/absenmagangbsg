import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter');

    let whereClause = {};
    
    if (filter === 'Hari Ini') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      whereClause = {
        timestamp: {
          gte: startOfDay,
          lte: endOfDay,
        },
      };
    }

    const attendanceRecords = await prisma.attendance.findMany({
      where: whereClause,
      include: { user: { select: { name: true } } }, 
      orderBy: { timestamp: 'desc' },
    });

    const liveHistory = attendanceRecords.map(record => {
  const recordDate = new Date(record.timestamp);
  
  // Buat format tanggal, contoh: "Senin, 14 Juli 2025"
  const dateString = recordDate.toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  // Buat format jam, contoh: "14:00 WITA"
  const timeString = recordDate.toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit'
  }) + ' WITA';

  return {
    id: record.id,
    name: record.user.name,
    type: record.type as 'Hadir' | 'Pulang' | 'Izin',
    title: record.type === 'Hadir' ? 'Absen Masuk' : record.type === 'Pulang' ? 'Absen Pulang' : 'Pengajuan Izin',
    
    // Ganti 'description' dengan format gabungan
    description: record.type === 'Izin' ? record.description : `${dateString} (${timeString})`,
    
    isLate: record.isLate,
    photoUrl: record.photoUrl,
    lat: record.latitude,
    lon: record.longitude,
  };
});

    return NextResponse.json(liveHistory);

  } catch (error) {
    console.error("Error mengambil riwayat live:", error);
    return NextResponse.json({ error: 'Gagal mengambil riwayat absensi' }, { status: 500 });
  }
}