import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient, Attendance } from '@prisma/client'; // 1. Impor tipe 'Attendance'
import { verify } from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('authToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }
    const decodedToken = verify(token, JWT_SECRET) as { userId: number };
    const userId = decodedToken.userId;

    const attendanceHistory = await prisma.attendance.findMany({
      where: { userId: userId },
      orderBy: { timestamp: 'desc' },
    });

    // 2. Beri tipe 'Attendance' pada parameter 'item'
    const formattedHistory = attendanceHistory.map((item: Attendance) => ({
      id: item.id,
      type: item.type as 'Hadir' | 'Pulang' | 'Izin',
      title: item.type === 'Hadir' ? 'Absen Masuk' : item.type === 'Pulang' ? 'Absen Pulang' : 'Pengajuan Izin',
      date: new Date(item.timestamp).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      description: item.description,
      lat: item.latitude,
      lon: item.longitude,
      photoUrl: item.photoUrl,
    }));

    return NextResponse.json(formattedHistory);

  } catch (error) {
    console.error("Error mengambil riwayat:", error);
    return NextResponse.json({ error: 'Gagal mengambil riwayat absensi' }, { status: 500 });
  }
}