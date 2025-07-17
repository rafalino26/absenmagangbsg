import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

// FUNGSI UNTUK MENGEDIT DATA (PATCH)
export async function PATCH(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID peserta tidak ada' }, { status: 400 });

    const body = await req.json();
    let dataToUpdate: any = {};

    // Cek apakah aksinya adalah 'archive'
    if (body.action === 'archive') {
      dataToUpdate.isActive = false;
    } else {
      // Jika tidak, ini adalah proses edit biasa
      const { name, division, periodStartDate, periodEndDate, password } = body;
      dataToUpdate = { 
        name, 
        division,
        periodStartDate: new Date(periodStartDate),
        periodEndDate: new Date(periodEndDate) 
      };
      if (password) {
        dataToUpdate.password = await hash(password, 10);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memperbarui data' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID peserta tidak ada' }, { status: 400 });
    }
    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Peserta berhasil dihapus permanen' });
  } catch (error) {
    console.error("Error saat hapus permanen:", error);
    return NextResponse.json({ error: 'Gagal menghapus data' }, { status: 500 });
  }
}