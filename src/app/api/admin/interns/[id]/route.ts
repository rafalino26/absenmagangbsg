// app/api/admin/interns/[id]/route.ts
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
      return { error: 'Akses ditolak.', status: 403 };
    }
    return { userId: decoded.userId };
  } catch (error) {
    return { error: 'Token tidak valid', status: 401 };
  }
}

// FUNGSI UNTUK MENGEDIT ATAU MENGARSIPKAN PESERTA (PATCH)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifySuperAdmin(req);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const id = parseInt(params.id);
    const body = await req.json();
    const { name, division, periodStartDate, periodEndDate, password, mentorId, isActive } = body;

    let dataToUpdate: Prisma.UserUpdateInput = {};

    // Cek field satu per satu. Ini memungkinkan API menangani edit biasa DAN arsip.
    if (name !== undefined) dataToUpdate.name = name;
    if (division !== undefined) dataToUpdate.division = division;
    if (periodStartDate !== undefined) dataToUpdate.periodStartDate = new Date(periodStartDate);
    if (periodEndDate !== undefined) dataToUpdate.periodEndDate = new Date(periodEndDate);
   if (mentorId !== undefined) {
      dataToUpdate.mentor = {
        connect: {
          id: parseInt(mentorId)
        }
      };
    }
    if (isActive !== undefined) dataToUpdate.isActive = isActive; // <-- PENTING UNTUK ARSIP
    if (password) {
      dataToUpdate.password = await hash(password, 10);
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('[UPDATE INTERN ERROR]', error);
    return NextResponse.json({ error: 'Gagal memperbarui data peserta' }, { status: 500 });
  }
}

// FUNGSI UNTUK MENGHAPUS PESERTA SECARA PERMANEN (DELETE)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const auth = await verifySuperAdmin(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
  
    try {
      const id = parseInt(params.id);

      // Sebelum menghapus user, hapus semua data yang berelasi dengannya
      // Ini untuk mencegah error foreign key constraint.
      await db.attendance.deleteMany({ where: { userId: id } });
      await db.helpdeskTicket.deleteMany({ where: { userId: id } });
      await db.dailyLog.deleteMany({ where: { userId: id } });
      
      // Setelah data terkait bersih, baru hapus user-nya
      await db.user.delete({ where: { id } });
  
      return NextResponse.json({ message: 'Peserta dan semua datanya berhasil dihapus permanen' });
    } catch (error) {
      console.error('[DELETE INTERN ERROR]', error);
      return NextResponse.json({ error: 'Gagal menghapus data peserta' }, { status: 500 });
    }
  }