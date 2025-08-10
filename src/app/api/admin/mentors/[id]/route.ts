// app/api/admin/mentors/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { Role, Prisma } from '@prisma/client';
import { verify } from 'jsonwebtoken';
import { hash } from 'bcrypt';

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

// FUNGSI UNTUK MENGEDIT DATA MENTOR (PATCH)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifySuperAdmin(req);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: 'Format ID tidak valid' }, { status: 400 });

    const body = await req.json();
    const { name, division, password } = body;

    let dataToUpdate: Prisma.UserUpdateInput = {};

    if (name !== undefined) dataToUpdate.name = name;
    if (division !== undefined) dataToUpdate.division = division;
    if (password) {
      dataToUpdate.password = await hash(password, 10);
    }

    const updatedMentor = await db.user.update({
      where: { id },
      data: dataToUpdate,
    });

    const { password: _, ...mentorData } = updatedMentor;
    return NextResponse.json(mentorData);

  } catch (error) {
    console.error('[UPDATE MENTOR ERROR]', error);
    return NextResponse.json({ error: 'Gagal memperbarui data mentor' }, { status: 500 });
  }
}

// FUNGSI UNTUK MENGHAPUS MENTOR (DELETE)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifySuperAdmin(req);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: 'Format ID tidak valid' }, { status: 400 });
    await db.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Mentor berhasil dihapus' });
  } catch (error) {
    console.error('[DELETE MENTOR ERROR]', error);
    return NextResponse.json({ error: 'Gagal menghapus mentor' }, { status: 500 });
  }
}