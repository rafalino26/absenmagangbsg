import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { verify } from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

// FUNGSI UNTUK MENGAMBIL SEMUA LAPORAN (UNTUK ADMIN)
export async function GET(req: NextRequest) {
  try {
    // Menghapus logika filter, sekarang hanya mengambil semua tiket
    const tickets = await prisma.helpdeskTicket.findMany({
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Error mengambil tiket helpdesk:", error);
    return NextResponse.json({ error: 'Gagal mengambil data laporan' }, { status: 500 });
  }
}

// FUNGSI UNTUK MENGIRIM LAPORAN BARU (DARI USER)
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('authToken')?.value;
    if (!token) return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    
    const decoded = verify(token, JWT_SECRET) as { userId: number };
    const userId = decoded.userId;
    
    const formData = await req.formData();
    const description = formData.get('description') as string;
    const photoFile = formData.get('photo') as File | null;

    if (!description) return NextResponse.json({ error: 'Deskripsi laporan wajib diisi.' }, { status: 400 });

    let photoUrl: string | null = null;
    if (photoFile) {
      const fileName = `helpdesk/${userId}-${Date.now()}-${photoFile.name}`;
      const { error } = await supabase.storage.from('attendance-proofs').upload(fileName, photoFile);
      if (error) throw new Error('Gagal upload bukti.');
      photoUrl = supabase.storage.from('attendance-proofs').getPublicUrl(fileName).data.publicUrl;
    }

    const newTicket = await prisma.helpdeskTicket.create({
      data: {
        userId,
        description,
        proofUrl: photoUrl,
      }
    });

    return NextResponse.json(newTicket, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengirim laporan' }, { status: 500 });
  }
}