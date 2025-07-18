import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verify, JsonWebTokenError } from 'jsonwebtoken';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('authToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }
    const decodedToken = verify(token, JWT_SECRET) as { userId: number };
    const userId = decodedToken.userId;

    const formData = await req.formData();
    const type = formData.get('type') as string;
    const description = formData.get('description') as string;
    const photoFile = formData.get('photo') as File | null;

    if (!type || !description) {
      return NextResponse.json({ error: 'Tipe dan keterangan wajib diisi.' }, { status: 400 });
    }
    
     let dataToSave: Prisma.AttendanceCreateInput = {
      type,
      description,
      user: { connect: { id: userId } }
    };
    
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
      const lat = formData.get('latitude');
      const lon = formData.get('longitude');

      // 5. Validasi data lokasi agar lebih tangguh
      if (lat && lon) {
        dataToSave.latitude = parseFloat(lat as string);
        dataToSave.longitude = parseFloat(lon as string);
        dataToSave.isLate = formData.get('isLate') === 'true';
      } else {
        return NextResponse.json({ error: 'Data lokasi tidak ditemukan untuk absensi ini.' }, { status: 400 });
      }
    }
    
    // 5. Simpan ke database
    const newAttendance = await db.attendance.create({ data: dataToSave });

    return NextResponse.json(newAttendance, { status: 201 });

  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      return NextResponse.json({ error: 'Token tidak valid' }, { status: 401 });
    }
    console.error("Error di API attendances:", error);
    // Beri pesan error yang lebih spesifik jika memungkinkan
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan pada server';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}