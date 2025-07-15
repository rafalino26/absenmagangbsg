import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verify } from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export async function GET(req: NextRequest) {
  try {
    // 1. Ambil token dari cookie
    const token = req.cookies.get('authToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    // 2. Verifikasi token untuk mendapatkan userId
    const decodedToken = verify(token, JWT_SECRET) as { userId: number };
    const userId = decodedToken.userId;

    // 3. Cari data user di database berdasarkan ID dari token
    const user = await prisma.user.findUnique({
      where: { id: userId },
      // Pilih hanya data yang kita butuhkan, jangan kirim password!
      select: {
        id: true,
        name: true,
        division: true,
        internshipPeriod: true,
        profilePicUrl: true,
        bankName: true,
        accountNumber: true,
        phoneNumber: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    // 4. Kirim data user ke frontend
    return NextResponse.json(user);

  } catch (error) {
    console.error("Error mengambil data user:", error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}