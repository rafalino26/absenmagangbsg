import { NextRequest, NextResponse } from 'next/server';

// Versi paling sederhana untuk tes
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Jika kode ini berhasil di-build, masalahnya ada pada
  // fungsi PATCH/DELETE atau dependensi yang mereka gunakan (Prisma, bcrypt, etc).
  
  const id = params.id;

  return NextResponse.json({ 
    message: `Ini adalah tes untuk ID: ${id}. Build berhasil.`,
    id: id 
  });
}