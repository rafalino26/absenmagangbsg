import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function getMonthDateRange(monthString: string) {
  const monthMap: { [key: string]: number } = { 'Januari': 0, 'Februari': 1, 'Maret': 2, 'April': 3, 'Mei': 4, 'Juni': 5, 'Juli': 6, 'Agustus': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Desember': 11 };
  const [monthName, year] = monthString.split(' ');
  const monthIndex = monthMap[monthName];
  if (monthIndex === undefined || !year) return null;
  const startDate = new Date(parseInt(year), monthIndex, 1);
  const endDate = new Date(parseInt(year), monthIndex + 1, 1);
  return { startDate, endDate };
}

// Fungsi GET sekarang tidak punya argumen kedua
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id'); // Ambil id dari query parameter
    const month = searchParams.get('month');

    if (!id) {
      return NextResponse.json({ error: 'ID peserta wajib diisi' }, { status: 400 });
    }

    const userId = parseInt(id);
    let dateFilter = {};
    if (month && month !== 'Semua Bulan') {
      const dateRange = getMonthDateRange(month);
      if (dateRange) {
        dateFilter = { timestamp: { gte: dateRange.startDate, lt: dateRange.endDate } };
      }
    }
    
    const attendanceRecords = await prisma.attendance.findMany({
      where: { userId, ...dateFilter },
      orderBy: { timestamp: 'desc' },
      include: { user: { select: { name: true } } }
    });

    const dailyLog = attendanceRecords.map(record => ({
      id: record.id, // <-- TAMBAHKAN BARIS INI
      date: new Date(record.timestamp).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      status: record.isLate ? 'Hadir (Terlambat)' : record.type as any,
      description: record.description,
      photoUrl: record.photoUrl,
      lat: record.latitude,
      lon: record.longitude,
      type: record.type as any,
      title: record.type === 'Hadir' ? 'Absen Masuk' : record.type === 'Pulang' ? 'Absen Pulang' : 'Pengajuan Izin',
    }));

    return NextResponse.json(dailyLog);

  } catch (error) {
    console.error("Error fetching daily log:", error);
    return NextResponse.json({ error: 'Gagal mengambil detail riwayat' }, { status: 500 });
  }
}