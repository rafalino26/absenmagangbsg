import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { db } from '@/lib/db'; 
import { Prisma } from '@prisma/client';

const attendanceWithUser = Prisma.validator<Prisma.AttendanceDefaultArgs>()({
  include: { user: { select: { name: true } } },
});

type AttendanceWithUser = Prisma.AttendanceGetPayload<typeof attendanceWithUser>;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter');

    let whereClause: Prisma.AttendanceWhereInput = {};
    
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

    const attendanceRecords = await db.attendance.findMany({
      where: whereClause,
      include: attendanceWithUser.include, 
      orderBy: { timestamp: 'desc' },
    });

    const liveHistory = attendanceRecords.map((record: AttendanceWithUser) => {
  const recordDate = new Date(record.timestamp);

  const dateString = recordDate.toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const timeString = recordDate.toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit'
  }) + ' WITA';

  return {
    id: record.id,
    name: record.user.name,
    type: record.type as 'Hadir' | 'Pulang' | 'Izin',
    title: record.type === 'Hadir' ? 'Absen Masuk' : record.type === 'Pulang' ? 'Absen Pulang' : 'Pengajuan Izin',
    description:`${dateString} (${timeString})`,
    reason: record.description, 
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