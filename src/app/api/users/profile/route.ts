import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db'; 
import { Prisma } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { verify, JsonWebTokenError } from 'jsonwebtoken';

// const prisma = new PrismaClient(); // <-- 3. Hapus baris ini
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get('authToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }
    const decodedToken = verify(token, JWT_SECRET) as { userId: number };
    const userId = decodedToken.userId;

    const formData = await req.formData();
    const photoFile = formData.get('photo') as File | null;
    const bankName = formData.get('bankName') as string | null;
    const accountNumber = formData.get('accountNumber') as string | null;
    const phoneNumber = formData.get('phoneNumber') as string | null;

    // 4. Gunakan tipe 'Prisma.UserUpdateInput' untuk keamanan maksimal
    let dataToUpdate: Prisma.UserUpdateInput = {};

    if (photoFile) {
      const fileName = `avatars/${userId}-${Date.now()}`;
      const { error: uploadError } = await supabase.storage
        .from('attendance-proofs')
        .upload(fileName, photoFile, { upsert: true });

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        throw new Error('Gagal mengupload foto profil.');
      }

      const { data: urlData } = supabase.storage.from('attendance-proofs').getPublicUrl(fileName);
      if (urlData) {
        dataToUpdate.profilePicUrl = urlData.publicUrl;
      }
    }

    if (bankName && accountNumber) {
      dataToUpdate.bankName = bankName;
      dataToUpdate.accountNumber = accountNumber;
    }
    
    if (phoneNumber) {
      dataToUpdate.phoneNumber = phoneNumber; 
    }

    if (Object.keys(dataToUpdate).length === 0) {
        return NextResponse.json({ error: 'Tidak ada data yang diperbarui.' }, { status: 400 });
    }

    const updatedUser = await db.user.update({ // <-- 5. Gunakan 'db'
      where: { id: userId },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      return NextResponse.json({ error: 'Token tidak valid' }, { status: 401 });
    }
    const errorMessage = error instanceof Error ? error.message : 'Gagal memperbarui profil';
    console.error("Update Profile Error:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}