import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { hash } from 'bcrypt';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

async function sendLoginDetailsByEmail(email: string, name: string, internCode: string, password: string) {
  // Konfigurasi "kantor pos" Gmail
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  // Kirim email
  await transporter.sendMail({
    from: `"Sistem Absensi" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Informasi Akun Absensi Magang Anda',
    html: `<h3>Selamat Datang, ${name}!</h3><p>Kode Magang: <b>${internCode}</b></p><p>Password: <b>${password}</b></p>`,
  });
}

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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');
    let dateFilter = {};

    if (month && month !== 'Semua Bulan') {
      const dateRange = getMonthDateRange(month);
      if (dateRange) {
        dateFilter = { timestamp: { gte: dateRange.startDate, lt: dateRange.endDate } };
      }
    }
    
    const interns = await prisma.user.findMany({
      where: {
        role: 'INTERN',
        isActive: true,
        attendances: month && month !== 'Semua Bulan' ? { some: dateFilter } : undefined,
      },
    });

    const summaryData = await Promise.all(
      interns.map(async (intern) => {
        const commonWhere = { userId: intern.id, ...dateFilter };
        
        const hadir = await prisma.attendance.count({ where: { ...commonWhere, type: 'Hadir' } });
        const izin = await prisma.attendance.count({ where: { ...commonWhere, type: 'Izin' } });
        const terlambat = await prisma.attendance.count({ where: { ...commonWhere, isLate: true } });
        const absen = 0; // Kembali ke placeholder

        return {
          id: intern.id,
          name: intern.name,
          division: intern.division,
          internshipPeriod: intern.internshipPeriod, // <-- Data ini tetap kita kirim
          joinDate: intern.joinDate.toISOString(),
          bankAccount: intern.bankName && intern.accountNumber ? { bank: intern.bankName, number: intern.accountNumber } : null,
          phoneNumber: intern.phoneNumber,
          hadir,
          izin,
          terlambat,
          absen,
          totalUangMakan: hadir * 15000,
          absenDates: '-', // Kembali ke placeholder
        };
      })
    );

    return NextResponse.json(summaryData);

  } catch (error) {
    console.error("Error saat mengambil data rekapitulasi:", error);
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}


export async function POST(req: Request) {
  let newInternId: number | null = null;
  
  try {
    const { name, division, period, email } = await req.json();

    if (!name || !division || !period || !email) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    // Buat user dengan password sementara untuk dapat ID
    const newIntern = await prisma.user.create({
      data: { name, division, internshipPeriod: period, email, password: 'PENDING' },
    });
    newInternId = newIntern.id; // Simpan ID-nya

    // Buat password asli dan hash
    const firstName = name.split(' ')[0].toLowerCase();
    const internCode = String(newIntern.id).padStart(3, '0');
    const autoPassword = `${firstName}${internCode}`;
    const hashedPassword = await hash(autoPassword, 10);
    
    // Update user dengan password yang sudah di-hash
    await prisma.user.update({
      where: { id: newIntern.id },
      data: { password: hashedPassword },
    });

    // Setelah user DIJAMIN berhasil dibuat & di-update, BARU coba kirim email
    try {
      await sendLoginDetailsByEmail(email, name, internCode, autoPassword);
    } catch (emailError) {
      console.error("GAGAL MENGIRIM EMAIL, TAPI USER SUDAH DIBUAT:", emailError);
      // Kirim respons sukses, TAPI dengan pesan peringatan
      return NextResponse.json({
        ...newIntern,
        warning: `Peserta berhasil dibuat (Kode: ${internCode}), tetapi notifikasi email gagal dikirim. Harap berikan info login secara manual.`
      });
    }
    
    return NextResponse.json(newIntern, { status: 201 });

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Email ini sudah terdaftar. Gunakan email lain.' }, { status: 409 });
    }
    console.error("Error saat membuat peserta:", error);
    return NextResponse.json({ error: 'Gagal membuat peserta baru atau mengirim email.' }, { status: 500 });
  }
}