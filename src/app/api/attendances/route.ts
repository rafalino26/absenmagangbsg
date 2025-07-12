import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { verify } from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// Inisialisasi Supabase Client untuk berinteraksi dengan Storage
// Ambil URL dan KEY dari file .env yang sudah ada di proyek NestJS temanmu, atau dari dashboard Supabase > API
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Gunakan SERVICE_KEY untuk akses di backend
);

export async function POST(req: NextRequest) {
  try {
    // 1. Verifikasi Pengguna dari Cookie
    const token = req.cookies.get('authToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    // Decode token untuk mendapatkan userId
    const decodedToken = verify(token, JWT_SECRET) as { userId: number };
    const userId = decodedToken.userId;

    // 2. Ambil data dari FormData (karena kita mengirim file)
    const formData = await req.formData();
    const photoFile = formData.get('photo') as File | null;
    const type = formData.get('type') as string;
    const latitude = parseFloat(formData.get('latitude') as string);
    const longitude = parseFloat(formData.get('longitude') as string);
    const description = formData.get('description') as string; // Untuk jam atau alasan izin
    const isLate = formData.get('isLate') === 'true';

    if (!type || !photoFile) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    // 3. Upload Foto ke Supabase Storage
    const fileName = `${userId}-${Date.now()}-${photoFile.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('attendance-proofs') // Nama bucket yang tadi kita buat
      .upload(fileName, photoFile);

    if (uploadError) {
      console.error('Supabase Upload Error:', uploadError);
      throw new Error('Gagal mengupload foto.');
    }

    // Dapatkan URL publik dari foto yang baru di-upload
    const { data: publicUrlData } = supabase.storage
      .from('attendance-proofs')
      .getPublicUrl(fileName);

    // 4. Simpan semua informasi ke database PostgreSQL via Prisma
    const newAttendance = await prisma.attendance.create({
      data: {
        userId,
        type,
        description,
        isLate,
        photoUrl: publicUrlData.publicUrl,
        latitude,
        longitude,
      }
    });

    return NextResponse.json(newAttendance, { status: 201 });

  } catch (error) {
    // Tangani error, termasuk jika token tidak valid
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Token tidak valid' }, { status: 401 });
    }
    console.error("Error di API attendances:", error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}