// src/app/api/storage/cleanup/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Inisialisasi Supabase client khusus untuk API Route ini
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const BUCKET_NAME = 'attendance-proofs';
    const FOLDER_TO_CLEAN = 'proofs';

    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list(FOLDER_TO_CLEAN, { limit: 1000 });

    if (listError) throw listError;
    if (!files || files.length === 0) {
      return NextResponse.json({ message: `Tidak ada file di folder '${FOLDER_TO_CLEAN}'.` });
    }

    const thresholdDate = new Date();
thresholdDate.setUTCHours(0, 0, 0, 0); // Set ke awal hari ini (UTC)
thresholdDate.setDate(thresholdDate.getDate() - 6); // Tetapkan batas waktu di awal hari 6 hari yang lalu

const filesToDelete = files.filter(file => new Date(file.created_at) < thresholdDate);

    if (filesToDelete.length === 0) {
      return NextResponse.json({ message: 'Tidak ada file yang perlu dihapus.' });
    }

    const fileNamesToDelete = filesToDelete.map(file => `${FOLDER_TO_CLEAN}/${file.name}`);
    const { error: removeError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(fileNamesToDelete);

    if (removeError) throw removeError;

    return NextResponse.json({ message: `Berhasil menghapus ${fileNamesToDelete.length} file.` });
    console.log(`[CLEANUP-STORAGE] Successfully deleted ${fileNamesToDelete.length} files.`);

  } catch (error: any) {
    console.error('[STORAGE CLEANUP ERROR]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}