import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

// Fungsi helper untuk mengubah string "Bulan Tahun" menjadi rentang tanggal
function getMonthDateRange(monthString: string) {
  const monthMap: { [key: string]: number } = {
    'Januari': 0, 'Februari': 1, 'Maret': 2, 'April': 3, 'Mei': 4, 'Juni': 5,
    'Juli': 6, 'Agustus': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Desember': 11
  };
  const [monthName, year] = monthString.split(' ');
  const monthIndex = monthMap[monthName];

  if (monthIndex === undefined || !year) {
    return null;
  }
  
  const startDate = new Date(parseInt(year), monthIndex, 1);
  const endDate = new Date(parseInt(year), monthIndex + 1, 1);
  
  return { startDate, endDate };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');

    // Tentukan rentang tanggal untuk filter
    let dateFilter = {};
    if (month && month !== 'Semua Bulan') {
      const dateRange = getMonthDateRange(month);
      if (dateRange) {
        dateFilter = {
          timestamp: {
            gte: dateRange.startDate,
            lt: dateRange.endDate,
          }
        };
      }
    }

    // Ambil semua user intern yang aktif
    const interns = await prisma.user.findMany({
      where: {
        role: 'INTERN',
        isActive: true,
        attendances: month && month !== 'Semua Bulan' ? { 
          some: dateFilter 
        } : undefined,
      },
    });

    // Hitung rekapitulasi untuk setiap intern
    const summaryData = await Promise.all(
      interns.map(async (intern) => {
        const commonWhere = { userId: intern.id, ...dateFilter };

        // Hitung semua statistik menggunakan Prisma
        const hadir = await prisma.attendance.count({ where: { ...commonWhere, type: 'Hadir' } });
        const izin = await prisma.attendance.count({ where: { ...commonWhere, type: 'Izin' } });
        const terlambat = await prisma.attendance.count({ where: { ...commonWhere, isLate: true } });
        const absen = 0; // Placeholder

        return {
          id: intern.id,
          name: intern.name,
          division: intern.division,
          internshipPeriod: intern.internshipPeriod,
          joinDate: intern.joinDate.toISOString(),
          bankAccount: intern.bankName && intern.accountNumber
            ? { bank: intern.bankName, number: intern.accountNumber }
            : null,
          // Data hasil perhitungan asli
          hadir,
          izin,
          terlambat,
          absen,
          totalUangMakan: hadir * 15000,
        };
      })
    );

    return NextResponse.json(summaryData);

  } catch (error) {
    console.error("Error saat mengambil data rekapitulasi:", error);
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}


// --- FUNGSI POST (MENAMBAH DATA) ---
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { name, division, period, password } = data;

    if (!name || !division || !period || !password) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    const hashedPassword = await hash(password, 10);

    const newIntern = await prisma.user.create({
      data: {
        name,
        password: hashedPassword,
        division,
        internshipPeriod: period,
      },
    });
    
    return NextResponse.json(newIntern, { status: 201 });
  } catch (error) {
    console.error("Error saat membuat peserta:", error);
    return NextResponse.json({ error: 'Gagal membuat peserta baru' }, { status: 500 });
  }
}