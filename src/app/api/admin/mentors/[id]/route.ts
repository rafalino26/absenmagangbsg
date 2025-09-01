// app/api/admin/mentors/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { Role, Prisma } from '@prisma/client';
import { verify } from 'jsonwebtoken';
import { hash } from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// Fungsi bantuan untuk verifikasi Superadmin (tidak diubah)
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

/**
 * FUNGSI UNTUK MENGEDIT DATA MENTOR ATAU DOSEN (PATCH)
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifySuperAdmin(req);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: 'Format ID tidak valid' }, { status: 400 });

    // 1. Ambil data user yang akan di-update untuk mengetahui rolenya
    const userToUpdate = await db.user.findUnique({ where: { id } });
    if (!userToUpdate) {
      return NextResponse.json({ error: 'Akun tidak ditemukan' }, { status: 404 });
    }

    const body = await req.json();
    const { name, password, divisionId, universityId } = body;

    // 2. Siapkan data yang akan di-update secara dinamis
    let dataToUpdate: Prisma.UserUpdateInput = {};

    if (name !== undefined) dataToUpdate.name = name;
    if (password) {
      dataToUpdate.password = await hash(password, 10);
    }

    // 3. Terapkan logika berdasarkan role user yang ada di database
    if (userToUpdate.role === Role.ADMIN) {
      if (divisionId !== undefined) {
        // Jika divisionId dikirim, hubungkan. Jika null, putuskan.
        dataToUpdate.division = divisionId ? { connect: { id: parseInt(divisionId) } } : { disconnect: true };
      }
    } else if (userToUpdate.role === Role.LECTURER) {
      if (universityId !== undefined) {
        // Jika universityId dikirim, hubungkan. Jika null, putuskan.
        dataToUpdate.university = universityId ? { connect: { id: parseInt(universityId) } } : { disconnect: true };
      }
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: dataToUpdate,
    });

    const { password: _, ...userData } = updatedUser;
    return NextResponse.json(userData);

  } catch (error) {
    console.error('[UPDATE USER ERROR]', error);
    return NextResponse.json({ error: 'Gagal memperbarui data akun' }, { status: 500 });
  }
}

/**
 * FUNGSI UNTUK MENGHAPUS MENTOR ATAU DOSEN (DELETE)
 */
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

    return NextResponse.json({ message: 'Akun berhasil dihapus' });
  } catch (error) {
    console.error('[DELETE USER ERROR]', error);
    return NextResponse.json({ error: 'Gagal menghapus akun' }, { status: 500 });
  }
}