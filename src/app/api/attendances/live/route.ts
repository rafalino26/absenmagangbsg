import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { db } from '@/lib/db'; 
import { Prisma, Role } from '@prisma/client';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

const attendanceWithUser = Prisma.validator<Prisma.AttendanceDefaultArgs>()({
  include: { user: { select: { name: true } } },
});

type AttendanceWithUser = Prisma.AttendanceGetPayload<typeof attendanceWithUser>;

export async function GET(req: NextRequest) {
  try {
    // 1. Verifikasi token untuk mendapatkan role dan id
    const token = req.cookies.get('adminAuthToken')?.value;
    if (!token) return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    const decoded = verify(token, JWT_SECRET) as { userId: number; role: Role };

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter');

    let whereClause: Prisma.AttendanceWhereInput = {};
    
    // 2. Tambahkan filter berdasarkan mentor jika role-nya ADMIN
    if (decoded.role === Role.ADMIN) {
      whereClause.user = { mentorId: decoded.userId };
    }
    
    if (filter === 'Hari Ini') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      whereClause.timestamp = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const attendanceRecords = await db.attendance.findMany({
      where: whereClause, // 3. Terapkan whereClause yang sudah dinamis
      include: attendanceWithUser.include, 
      orderBy: { timestamp: 'desc' },
    });

    const liveHistory = attendanceRecords.map((record: AttendanceWithUser) => {
      const recordDate = new Date(record.timestamp);
      const dateString = recordDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      const timeString = recordDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Makassar' });

      return {
        id: record.id,
        name: record.user.name,
        type: record.type,
        title: record.type === 'Hadir' ? 'Absen Masuk' : record.type === 'Pulang' ? 'Absen Pulang' : 'Pengajuan Izin',
        description: `${dateString} (${timeString} WITA)`,
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