import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db'; 
import { Prisma } from '@prisma/client'; 
import { hash } from 'bcrypt';

export async function PATCH(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID peserta tidak ada' }, { status: 400 });

    const userId = parseInt(id, 10);
    if (isNaN(userId)) return NextResponse.json({ error: 'Format ID tidak valid' }, { status: 400 });

    const body = await req.json();
    
    let dataToUpdate: Prisma.UserUpdateInput = {};

    if (body.action === 'archive') {
      dataToUpdate.isActive = false;
    } else {
      const { name, division, periodStartDate, periodEndDate, password } = body;
      
      if (name) dataToUpdate.name = name;
      if (division) dataToUpdate.division = division;
      if (periodStartDate) dataToUpdate.periodStartDate = new Date(periodStartDate);
      if (periodEndDate) dataToUpdate.periodEndDate = new Date(periodEndDate);
      
      if (password) {
        dataToUpdate.password = await hash(password, 10);
      }
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error saat update:", error);
    return NextResponse.json({ error: 'Gagal memperbarui data' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID peserta tidak ada' }, { status: 400 });

    const userId = parseInt(id, 10);
    if (isNaN(userId)) return NextResponse.json({ error: 'Format ID tidak valid' }, { status: 400 });
    
    await db.user.delete({ 
      where: { id: userId },
    });

    return NextResponse.json({ message: 'Peserta berhasil dihapus permanen' });
  } catch (error) {
    console.error("Error saat hapus permanen:", error);
    return NextResponse.json({ error: 'Gagal menghapus data' }, { status: 500 });
  }
}