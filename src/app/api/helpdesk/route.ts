import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { Prisma, Role } from '@prisma/client'; 
import { createClient } from '@supabase/supabase-js';
import { verify, JsonWebTokenError } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

const ticketWithUser = Prisma.validator<Prisma.HelpdeskTicketDefaultArgs>()({
  include: { user: { select: { name: true } } },
});
type TicketWithUser = Prisma.HelpdeskTicketGetPayload<typeof ticketWithUser>;


export async function GET(req: NextRequest) {
  try {
     const token = req.cookies.get('adminAuthToken')?.value;
    if (!token) return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    const decoded = verify(token, JWT_SECRET) as { userId: number; role: Role };

    let whereClause: Prisma.HelpdeskTicketWhereInput = {};

    // 2. Tambahkan filter mentor jika role-nya ADMIN
    if (decoded.role === Role.ADMIN) {
      whereClause.user = { mentorId: decoded.userId };
    }

    // 3. Query dijalankan dengan whereClause yang dinamis
    const tickets: TicketWithUser[] = await db.helpdeskTicket.findMany({
      where: whereClause,
      include: ticketWithUser.include,
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Error mengambil tiket helpdesk:", error);
    return NextResponse.json({ error: 'Gagal mengambil data laporan' }, { status: 500 });
  }
}

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

    let dataToSave: Prisma.HelpdeskTicketCreateInput = {
      description,
      user: { connect: { id: userId } }
    };

    if (photoFile) {
      const fileName = `helpdesk/${userId}-${Date.now()}-${photoFile.name}`;
      const { error: uploadError } = await supabase.storage.from('attendance-proofs').upload(fileName, photoFile);
      
      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        throw new Error('Gagal mengupload bukti laporan.');
      }
      
      const { data: urlData } = supabase.storage.from('attendance-proofs').getPublicUrl(fileName);
      dataToSave.proofUrl = urlData.publicUrl;
    }

    const newTicket = await db.helpdeskTicket.create({
      data: dataToSave
    });

    return NextResponse.json(newTicket, { status: 201 });
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
        return NextResponse.json({ error: 'Token tidak valid' }, { status: 401 });
    }
    const errorMessage = error instanceof Error ? error.message : 'Gagal mengirim laporan';
    console.error("Error POST helpdesk:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}