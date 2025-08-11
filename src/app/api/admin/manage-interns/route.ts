// src/app/api/admin/interns/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { Role } from '@prisma/client';
import { verify } from 'jsonwebtoken';
import { hash } from 'bcrypt';
import nodemailer from 'nodemailer'; // Kita akan butuh ini untuk kirim email

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// Fungsi bantuan untuk verifikasi Superadmin
async function verifySuperAdmin(req: NextRequest) {
  const token = req.cookies.get('adminAuthToken')?.value;
  if (!token) return { error: 'Tidak terautentikasi', status: 401 };
  try {
    const decoded = verify(token, JWT_SECRET) as { userId: number; role: Role };
    if (decoded.role !== Role.SUPER_ADMIN) {
      return { error: 'Akses ditolak. Hanya Superadmin.', status: 403 };
    }
    return { userId: decoded.userId };
  } catch (error) {
    return { error: 'Token tidak valid', status: 401 };
  }
}

// Fungsi bantuan untuk kirim email
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
        html: `<h3>Selamat Datang, ${name}!</h3><p>Akun Anda untuk sistem absensi magang telah berhasil dibuat.</p><p>Berikut adalah detail login Anda:</p><ul><li>Kode Magang: <b>${internCode}</b></li><li>Password: <b>${password}</b></li></ul><p>Harap simpan informasi ini dengan baik.</p>`,
    });
}

// FUNGSI UNTUK MENGAMBIL DAFTAR SEMUA PESERTA (GET)
export async function GET(req: NextRequest) {
  const auth = await verifySuperAdmin(req);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const interns = await db.user.findMany({
      where: {
        role: Role.INTERN,
        isActive: true,
      },
      select: {
        id: true,
        internCode: true,
        name: true,
        division: true,
        periodStartDate: true,
        periodEndDate: true,
        isActive: true,
        mentor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(interns);
  } catch (error) {
    console.error('[GET INTERNS ERROR]', error);
    return NextResponse.json({ error: 'Gagal mengambil data peserta' }, { status: 500 });
  }
}

// FUNGSI UNTUK MEMBUAT PESERTA BARU (POST)
export async function POST(req: NextRequest) {
  const auth = await verifySuperAdmin(req);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { name, division, email, periodStartDate, periodEndDate, mentorId } = await req.json();

    if (!name || !division || !periodStartDate || !periodEndDate) { // mentorId bisa opsional
      return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 });
    }
    
    // --- LOGIKA BARU UNTUK KODE MAGANG ---
    // 1. Cari peserta dengan internCode tertinggi
    const lastIntern = await db.user.findFirst({
        where: { role: Role.INTERN, internCode: { not: null } },
        orderBy: { id: 'desc' }, // Cek dari ID terbaru untuk efisiensi
        select: { internCode: true }
    });
    
    const lastCodeNumber = lastIntern?.internCode ? parseInt(lastIntern.internCode) : 0;
    const newInternCode = String(lastCodeNumber + 1).padStart(3, '0');
    // --- SELESAI LOGIKA BARU ---

    const firstName = name.split(' ')[0].toLowerCase();
    const autoPassword = `${firstName}${newInternCode}`;
    const hashedPassword = await hash(autoPassword, 10);
    
    const newIntern = await db.user.create({
      data: {
        internCode: newInternCode, // Simpan kode magang baru
        name,
        division,
        email,
        password: hashedPassword,
        role: Role.INTERN,
        periodStartDate: new Date(periodStartDate),
        periodEndDate: new Date(periodEndDate),
        mentorId: mentorId ? parseInt(mentorId) : null,
      },
    });

    if (email) {
      try {
        await sendLoginDetailsByEmail(email, name, newInternCode, autoPassword);
      } catch (emailError) {
        console.error(`GAGAL MENGIRIM EMAIL ke ${email}`, emailError);
        const { password, ...internData } = newIntern;
        return NextResponse.json({
          message: `Peserta berhasil dibuat (Kode: ${newInternCode}), tetapi notifikasi email gagal dikirim.`,
          warning: true,
          user: internData,
        }, { status: 201 });
      }
    }

    const { password: _, ...internData } = newIntern;
    return NextResponse.json(internData, { status: 201 });

  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target.includes('email')) {
      return NextResponse.json({ error: 'Email ini sudah terdaftar.' }, { status: 409 });
    }
    console.error('[CREATE INTERN ERROR]', error);
    return NextResponse.json({ error: 'Gagal membuat peserta baru' }, { status: 500 });
  }
}
