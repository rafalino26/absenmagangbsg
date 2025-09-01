// app/api/admin/universities/[id]/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { Role } from '@prisma/client';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

/**
 * Fungsi bantuan untuk memverifikasi token dan memastikan pengguna adalah Superadmin.
 * @param req Objek NextRequest
 * @returns Objek yang berisi userId jika valid, atau objek error.
 */
async function verifySuperAdmin(req: NextRequest) {
  const token = req.cookies.get('adminAuthToken')?.value;
  if (!token) {
    return { error: 'Tidak terautentikasi', status: 401 };
  }
  try {
    const decoded = verify(token, JWT_SECRET) as { userId: number; role: Role };
    if (decoded.role !== Role.SUPER_ADMIN) {
      return { error: 'Akses ditolak. Hanya Superadmin.', status: 403 };
    }
    return { userId: decoded.userId }; // Sukses
  } catch (error) {
    return { error: 'Token tidak valid', status: 401 };
  }
}

/**
 * FUNGSI UNTUK MENGHAPUS UNIVERSITAS (DELETE)
 * Menghapus satu data universitas berdasarkan ID.
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifySuperAdmin(req);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Format ID tidak valid' }, { status: 400 });
    }

    // Prisma akan secara otomatis menangani relasi. 
    // Pengguna yang terhubung dengan universitas ini akan memiliki universityId = null.
    await db.university.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Universitas berhasil dihapus.' });
  } catch (error) {
    console.error('[DELETE UNIVERSITY ERROR]', error);
    // Memberikan pesan error yang lebih umum untuk keamanan
    return NextResponse.json({ error: 'Gagal menghapus universitas.' }, { status: 500 });
  }
}