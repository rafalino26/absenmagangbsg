import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { verify } from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // 1. Verifikasi Pengguna dari Cookie (tetap sama)
    const token = req.cookies.get('authToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }
    const decodedToken = verify(token, JWT_SECRET) as { userId: number };
    const userId = decodedToken.userId;

    // 2. Ambil data dari FormData
    const formData = await req.formData();
    const type = formData.get('type') as string;
    const description = formData.get('description') as string;
    const photoFile = formData.get('photo') as File | null;

    if (!type || !description) {
      return NextResponse.json({ error: 'Tipe dan keterangan wajib diisi.' }, { status: 400 });
    }
    
    let dataToSave: any = { userId, type, description };
    
    // 3. Jika ada file foto/lampiran, upload ke Supabase
    if (photoFile) {
      const fileName = `proofs/${userId}-${Date.now()}-${photoFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('attendance-proofs')
        .upload(fileName, photoFile);

      if (uploadError) throw new Error('Gagal mengupload bukti.');
      
      const { data: urlData } = supabase.storage.from('attendance-proofs').getPublicUrl(fileName);
      dataToSave.photoUrl = urlData.publicUrl;
    }
    
    // 4. Tambahkan data lokasi HANYA jika tipenya bukan 'Izin'
    if (type === 'Hadir' || type === 'Pulang') {
      dataToSave.latitude = parseFloat(formData.get('latitude') as string);
      dataToSave.longitude = parseFloat(formData.get('longitude') as string);
      dataToSave.isLate = formData.get('isLate') === 'true';
    }
    
    // 5. Simpan ke database
    const newAttendance = await prisma.attendance.create({ data: dataToSave });

    return NextResponse.json(newAttendance, { status: 201 });

  } catch (error) {
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Token tidak valid' }, { status: 401 });
    }
    console.error("Error di API attendances:", error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}