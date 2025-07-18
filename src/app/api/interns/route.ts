import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db'; 
import { Prisma, User } from '@prisma/client'; 
import { hash } from 'bcrypt';
import nodemailer from 'nodemailer';

async function sendLoginDetailsByEmail(email: string, name: string, internCode: string, password: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"Sistem Absensi" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Informasi Akun Absensi Magang Anda',
    html: `
      <div style="font-family: sans-serif; line-height: 1.6;">
        <h3>Selamat Datang, ${name}!</h3>
        <p>Akun Anda untuk sistem absensi magang telah berhasil dibuat.</p>
        <p>Berikut adalah detail login Anda:</p>
        <ul>
          <li>Kode Magang: <b>${internCode}</b></li>
          <li>Password: <b>${password}</b></li>
        </ul>
        <p>Harap simpan informasi ini dengan baik dan segera login ke sistem.</p>
        <br>
        <p>Terima kasih.</p>
      </div>
    `,
  });
}

function getMonthDateRange(monthString: string) {
  const monthMap: { [key: string]: number } = { 'Januari': 0, 'Februari': 1, 'Maret': 2, 'April': 3, 'Mei': 4, 'Juni': 5, 'Juli': 6, 'Agustus': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Desember': 11 };
  const [monthName, year] = monthString.split(' ');
  const monthIndex = monthMap[monthName];
  if (monthIndex === undefined || !year) return null;
  const startDate = new Date(parseInt(year), monthIndex, 1);
  const endDate = new Date(parseInt(year), monthIndex + 1, 1);
  return { startDate, endDate };
}

export async function GET(req: NextRequest) {
  try {
    const month = req.nextUrl.searchParams.get('month');
    let dateFilter: Prisma.AttendanceWhereInput = {};
    let periodFilter: Prisma.UserWhereInput = {};

    if (month && month !== 'Semua Bulan') {
      const dateRange = getMonthDateRange(month);
      if (dateRange) {
        dateFilter = { timestamp: { gte: dateRange.startDate, lt: dateRange.endDate } };
        periodFilter = { periodStartDate: { lte: dateRange.endDate }, periodEndDate: { gte: dateRange.startDate } };
      }
    }
    
    const interns = await db.user.findMany({ 
      where: { role: 'INTERN', isActive: true, ...periodFilter },
      orderBy: { name: 'asc' },
    });

    const summaryData = await Promise.all(
      interns.map(async (intern: User) => {
        const commonWhere = { userId: intern.id, ...dateFilter };
        
        const hadir = await db.attendance.count({ where: { ...commonWhere, type: 'Hadir' } });
        const izin = await db.attendance.count({ where: { ...commonWhere, type: 'Izin' } });
        const terlambat = await db.attendance.count({ where: { ...commonWhere, isLate: true } });
        const absen = 0; 

        return {
          id: intern.id,
          name: intern.name,
          division: intern.division,
          periodStartDate: intern.periodStartDate?.toISOString(),
          periodEndDate: intern.periodEndDate?.toISOString(),
          joinDate: intern.joinDate.toISOString(),
          bankAccount: intern.bankName && intern.accountNumber ? { bank: intern.bankName, number: intern.accountNumber } : null,
          phoneNumber: intern.phoneNumber,
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
    return NextResponse.json({ error: 'Gagal mengambil data rekapitulasi' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, division, email, periodStartDate, periodEndDate } = await req.json();

    if (!name || !division || !email || !periodStartDate || !periodEndDate) {
      return NextResponse.json({ error: 'Semua data wajib diisi' }, { status: 400 });
    }
    const dataToCreate: Prisma.UserCreateInput = {
      name,
      division,
      email,
      password: 'PENDING_PASSWORD_GENERATION', 
      periodStartDate: new Date(periodStartDate),
      periodEndDate: new Date(periodEndDate),
    };

    const newIntern = await db.user.create({ data: dataToCreate });

    const firstName = name.split(' ')[0].toLowerCase();
    const internCode = String(newIntern.id).padStart(3, '0');
    const autoPassword = `${firstName}${internCode}`;

    const hashedPassword = await hash(autoPassword, 10);
    await db.user.update({
      where: { id: newIntern.id },
      data: { password: hashedPassword },
    });
    
    try {
      await sendLoginDetailsByEmail(email, name, internCode, autoPassword);
    } catch (emailError) {
      console.error(`GAGAL MENGIRIM EMAIL ke ${email} (User: ${name}, ID: ${newIntern.id}). Error:`, emailError);
      return NextResponse.json({
        message: `Peserta berhasil dibuat (Kode: ${internCode}), tetapi notifikasi email gagal dikirim.`,
        warning: true,
        user: newIntern,
      }, { status: 201 }); 
    }
    
    return NextResponse.json(newIntern, { status: 201 });

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Email ini sudah terdaftar.' }, { status: 409 });
    }
    console.error("Error saat membuat peserta:", error);
    return NextResponse.json({ error: 'Gagal membuat peserta baru.' }, { status: 500 });
  }
}