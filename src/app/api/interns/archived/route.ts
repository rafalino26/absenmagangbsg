import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; 

export async function GET() {
  try {
    const archivedInterns = await db.user.findMany({ 
      where: {
        role: 'INTERN',
        isActive: false,
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