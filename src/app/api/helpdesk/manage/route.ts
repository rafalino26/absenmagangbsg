// app/api/helpdesk/manage/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID tiket tidak ada' }, { status: 400 });
    }

    const ticketId = parseInt(id, 10);
    if (isNaN(ticketId)) {
      return NextResponse.json({ error: 'Format ID tidak valid' }, { status: 400 });
    }
    const ticketToDelete = await db.helpdeskTicket.findUnique({
      where: { id: ticketId },
      select: { proofUrl: true },
    });
    if (ticketToDelete?.proofUrl) {
      try {
        const filePath = ticketToDelete.proofUrl.split('/attendance-proofs/')[1];
        await supabase.storage.from('attendance-proofs').remove([filePath]);
      } catch (storageError) {
        console.error("Gagal hapus file dari storage, tapi proses lanjut:", storageError);
      }
    }

    await db.helpdeskTicket.delete({
      where: { id: ticketId },
    });

    return NextResponse.json({ message: 'Laporan berhasil dihapus permanen' });

  } catch (error) {
    console.error("Error saat hapus laporan:", error);
    return NextResponse.json({ error: 'Gagal menghapus laporan' }, { status: 500 });
  }
}