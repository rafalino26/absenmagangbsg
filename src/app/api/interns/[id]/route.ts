import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

// FUNGSI UNTUK MENGEDIT DATA (PATCH)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const body = await req.json();
    const { name, division, internshipPeriod, password } = body;

    let dataToUpdate: any = { name, division, internshipPeriod };

    // Jika ada password baru, hash password tersebut
    if (password) {
      dataToUpdate.password = await hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memperbarui data' }, { status: 500 });
  }
}

// FUNGSI UNTUK MENGHAPUS DATA (DELETE)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);

    // Lakukan soft delete dengan mengubah 'isActive' menjadi false
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: 'Peserta berhasil dihapus (diarsip)' });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus data' }, { status: 500 });
  }
}