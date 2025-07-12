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


// --- FUNGSI GET (MENGAMBIL DATA) ---
export async function GET(req: Request) {
  try {
    // 1. Ambil parameter dari URL yang dikirim frontend
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month'); // Contoh: 'Juli 2025'

        let whereClause: any = {
      // TAMBAHKAN KONDISI INI:
      // Hanya ambil user yang rolenya adalah INTERN
      role: 'INTERN', 
    };

    // 2. Jika ada filter bulan (dan bukan "Semua Bulan"), buat kondisinya
    if (month && month !== 'Semua Bulan') {
      const dateRange = getMonthDateRange(month);
      if (dateRange) {
        whereClause = {
          joinDate: {
            gte: dateRange.startDate, // gte: greater than or equal (lebih besar atau sama dengan tgl 1)
            lt: dateRange.endDate,    // lt: less than (lebih kecil dari tgl 1 bulan berikutnya)
          }
        };
      }
    }

    // 3. Ambil data user dari database dengan menerapkan filter
    const interns = await prisma.user.findMany({
      where: whereClause, // Terapkan filter di sini
      orderBy: { joinDate: 'desc' },
    });

    // 4. Simulasi penambahan data rekapitulasi (tetap sama seperti sebelumnya)
    const summaryData = interns.map(intern => {
      const hadir = 20;
      const izin = 1;
      const terlambat = 2;
      const absen = Math.max(0, 22 - hadir - izin);

      return {
        ...intern,
        hadir,
        izin,
        absen,
        terlambat,
        totalUangMakan: hadir * 15000,
        joinDate: intern.joinDate.toISOString(),
      };
    });

    return NextResponse.json(summaryData);

  } catch (error) {
    console.error("Error saat mengambil data peserta:", error);
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