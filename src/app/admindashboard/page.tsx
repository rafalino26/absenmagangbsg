import { redirect } from 'next/navigation';

export default function AdminDashboardRedirectPage() {
  // Langsung arahkan ke halaman rekapitulasi sebagai halaman default
  redirect('/admindashboard/rekapitulasi');

  // Komponen ini tidak akan pernah di-render, tapi harus mengembalikan sesuatu.
  return null;
}