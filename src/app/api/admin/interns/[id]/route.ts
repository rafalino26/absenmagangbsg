// src/app/api/admin/interns/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { Role, Prisma } from '@prisma/client';
import { verify } from 'jsonwebtoken';
import { hash } from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

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

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifySuperAdmin(req);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: 'Format ID tidak valid' }, { status: 400 });

    const body = await req.json();
    const { name, division, periodStartDate, periodEndDate, password, mentorId, isActive } = body;

    let dataToUpdate: Prisma.UserUpdateInput = {};

    if (name !== undefined) dataToUpdate.name = name;
    if (division !== undefined) dataToUpdate.division = division;
    if (periodStartDate !== undefined) dataToUpdate.periodStartDate = new Date(periodStartDate);
    if (periodEndDate !== undefined) dataToUpdate.periodEndDate = new Date(periodEndDate);
    if (isActive !== undefined) dataToUpdate.isActive = isActive;
    if (mentorId !== undefined) {
      dataToUpdate.mentor = { connect: { id: parseInt(mentorId) } };
    }
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

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifySuperAdmin(req);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: 'Format ID tidak valid' }, { status: 400 });

    await db.attendance.deleteMany({ where: { userId: id } });
    await db.helpdeskTicket.deleteMany({ where: { userId: id } });
    await db.dailyLog.deleteMany({ where: { userId: id } });
    
    await db.user.delete({ where: { id } });

    return NextResponse.json({ message: 'Peserta dan semua datanya berhasil dihapus permanen' });
  } catch (error) {
    console.error('[DELETE INTERN ERROR]', error);
    return NextResponse.json({ error: 'Gagal menghapus data peserta' }, { status: 500 });
  }
}