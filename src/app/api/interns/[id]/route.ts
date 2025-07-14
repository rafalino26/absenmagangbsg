import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

// FUNGSI UNTUK MENGEDIT DATA (PATCH)
// PERBAIKAN: Gunakan 'any' untuk argumen kedua
export async function PATCH(req: NextRequest, context: any) {
  try {
    const id = parseInt(context.params.id);
    const body = await req.json();
    const { name, division, internshipPeriod, password } = body;

    let dataToUpdate: any = { name, division, internshipPeriod };

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
// PERBAIKAN: Gunakan 'any' untuk argumen kedua
export async function DELETE(req: NextRequest, context: any) {
  try {
    const id = parseInt(context.params.id);

    await prisma.user.update({
      where: { id },
      data: { isActive: false }, // Soft delete
    });

    return NextResponse.json({ message: 'Peserta berhasil diarsip' });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus data' }, { status: 500 });
  }
}