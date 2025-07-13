import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { verify } from 'jsonwebtoken';

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// Kita gunakan metode PATCH karena kita hanya meng-update sebagian data user
export async function PATCH(req: NextRequest) {
  try {
    // 1. Verifikasi user dari token
    const token = req.cookies.get('authToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }
    const decodedToken = verify(token, JWT_SECRET) as { userId: number };
    const userId = decodedToken.userId;

    // 2. Ambil data dari FormData
    const formData = await req.formData();
    const photoFile = formData.get('photo') as File | null;
    const bankName = formData.get('bankName') as string | null;
    const accountNumber = formData.get('accountNumber') as string | null;

    let dataToUpdate: any = {};

    // 3. Jika ada foto baru, upload ke Supabase dan siapkan URL-nya
    if (photoFile) {
      const fileName = `avatars/${userId}-${Date.now()}`;
      const { error: uploadError } = await supabase.storage
        .from('attendance-proofs') // Kamu bisa buat bucket baru 'avatars' atau pakai yang sama
        .upload(fileName, photoFile, { upsert: true }); // upsert: true akan menimpa foto lama

      if (uploadError) throw new Error('Gagal mengupload foto profil.');

      const { data: urlData } = supabase.storage.from('attendance-proofs').getPublicUrl(fileName);
      dataToUpdate.profilePicUrl = urlData.publicUrl;
    }

    // 4. Jika ada data rekening baru, siapkan datanya
    if (bankName && accountNumber) {
      dataToUpdate.bankName = bankName;
      dataToUpdate.accountNumber = accountNumber;
    }
    
    // 5. Update data di database menggunakan Prisma
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error("Update Profile Error:", error);
    return NextResponse.json({ error: 'Gagal memperbarui profil' }, { status: 500 });
  }
}