import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST() {
  // Hapus cookie user
  const userCookie = serialize('authToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: -1, // Atur masa berlaku ke masa lalu agar cookie langsung dihapus
    path: '/',
  });
  
  // Hapus cookie admin
  const adminCookie = serialize('adminAuthToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: -1,
    path: '/',
  });

  // Kirim respons dengan header untuk menghapus kedua cookie
  const response = NextResponse.json({ message: 'Logout berhasil' });
  response.headers.append('Set-Cookie', userCookie);
  response.headers.append('Set-Cookie', adminCookie);

  return response;
}