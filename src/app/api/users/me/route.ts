import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db'; 
import { Prisma } from '@prisma/client'; 
import { verify, JsonWebTokenError } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

const userProfileSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  name: true,
  division: true,
  periodStartDate: true,
  periodEndDate: true,
  profilePicUrl: true,
  bankName: true,
  accountNumber: true,
  phoneNumber: true,
});

type UserProfile = Prisma.UserGetPayload<{ select: typeof userProfileSelect }>;

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('authToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }
    const decodedToken = verify(token, JWT_SECRET) as { userId: number };
    const userId = decodedToken.userId;
    const user: UserProfile | null = await db.user.findUnique({
      where: { id: userId },
      select: userProfileSelect,
    });

    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(user);

  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      return NextResponse.json({ error: 'Token tidak valid' }, { status: 401 });
    }
    console.error("Error mengambil data user:", error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}