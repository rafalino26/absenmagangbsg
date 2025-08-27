// src/app/api/logs/user/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { verify } from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// Inisialisasi Supabase client di sini
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// FUNGSI UNTUK MENGAMBIL LOG MILIK USER SENDIRI (GET)
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('authToken')?.value;
    if (!token) return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    const decoded = verify(token, JWT_SECRET) as { userId: number };
    
    const logs = await db.dailyLog.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data log' }, { status: 500 });
  }
}

// FUNGSI UNTUK MENGIRIM LOG BARU (POST)
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('authToken')?.value;
    if (!token) return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    const decoded = verify(token, JWT_SECRET) as { userId: number };
    
    // Baca data sebagai FormData
    const formData = await req.formData();
    const activities = formData.get('activities') as string;
    const otherActivity = formData.get('otherActivity') as string;
    const photoFile = formData.get('photo') as File | null;

    if (!photoFile) {
      return NextResponse.json({ error: 'Foto bukti wajib diisi.' }, { status: 400 });
    }

    let finalActivity = activities;
    if (otherActivity && otherActivity.trim() !== '') {
      finalActivity += `, ${otherActivity}`;
    }

    if (!finalActivity) {
      return NextResponse.json({ error: 'Aktivitas tidak boleh kosong.' }, { status: 400 });
    }

    // Upload foto ke Supabase Storage
    const fileName = `logs/${decoded.userId}-${Date.now()}-${photoFile.name}`;
    const { error: uploadError } = await supabase.storage
      .from('attendance-proofs')
      .upload(fileName, photoFile);

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      throw new Error('Gagal mengupload foto bukti.');
    }
    
    const { data: urlData } = supabase.storage.from('attendance-proofs').getPublicUrl(fileName);

    const newLog = await db.dailyLog.create({
      data: {
        userId: decoded.userId,
        activity: finalActivity,
        photoUrl: urlData.publicUrl,
      },
    });

    return NextResponse.json(newLog, { status: 201 });
  } catch (error: any) {
    console.error('[POST LOG ERROR]', error);
    return NextResponse.json({ error: 'Gagal menyimpan log', details: error.message }, { status: 500 });
  }
}
