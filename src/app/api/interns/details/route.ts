import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db'; 
import { Prisma } from '@prisma/client'; 

function getMonthDateRange(monthString: string) {
  const monthMap: { [key: string]: number } = { 'Januari': 0, 'Februari': 1, 'Maret': 2, 'April': 3, 'Mei': 4, 'Juni': 5, 'Juli': 6, 'Agustus': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Desember': 11 };
  const [monthName, year] = monthString.split(' ');
  const monthIndex = monthMap[monthName];
  if (monthIndex === undefined || !year) return null;
  const startDate = new Date(parseInt(year), monthIndex, 1);
  const endDate = new Date(parseInt(year), monthIndex + 1, 1);
  return { startDate, endDate };
}

const attendanceWithUser = Prisma.validator<Prisma.AttendanceDefaultArgs>()({
  include: { user: { select: { name: true } } },
});
type AttendanceWithUser = Prisma.AttendanceGetPayload<typeof attendanceWithUser>;


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const month = searchParams.get('month');

    if (!id) {
      return NextResponse.json({ error: 'ID peserta wajib diisi' }, { status: 400 });
    }

    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Format ID tidak valid' }, { status: 400 });
    }

    let dateFilter: Prisma.AttendanceWhereInput = {};
    if (month && month !== 'Semua Bulan') {
      const dateRange = getMonthDateRange(month);
      if (dateRange) {
        dateFilter = { timestamp: { gte: dateRange.startDate, lt: dateRange.endDate } };
      }
    }
    
    const attendanceRecords = await db.attendance.findMany({
      where: { userId, ...dateFilter },
      orderBy: { timestamp: 'desc' },
      include: attendanceWithUser.include,
    });

    const dailyLog = attendanceRecords.map((record: AttendanceWithUser) => ({
      id: record.id,
      date: new Date(record.timestamp).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      status: record.isLate ? 'Hadir (Terlambat)' : record.type,
      description: record.description,
      photoUrl: record.photoUrl,
      lat: record.latitude,
      lon: record.longitude,
      type: record.type, 
      isLate: true,
      title: record.type === 'Hadir' ? 'Absen Masuk' : record.type === 'Pulang' ? 'Absen Pulang' : 'Pengajuan Izin',
    }));

    return NextResponse.json(dailyLog);

  } catch (error) {
    console.error("Error fetching daily log:", error);
    return NextResponse.json({ error: 'Gagal mengambil detail riwayat' }, { status: 500 });
  }
}