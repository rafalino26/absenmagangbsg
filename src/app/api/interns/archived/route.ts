import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const archivedInterns = await prisma.user.findMany({
      where: {
        role: 'INTERN',
        isActive: false, // <-- Kuncinya di sini
      },
      orderBy: {
        joinDate: 'desc',
      },
    });

    return NextResponse.json(archivedInterns);

  } catch (error) {
    console.error("Error mengambil data arsip:", error);
    return NextResponse.json({ error: 'Gagal mengambil data arsip' }, { status: 500 });
  }
}