'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import Image from "next/image";
import { FiMenu, FiLogOut } from 'react-icons/fi'; // Impor ikon hamburger
import NotificationModal from '@/app/components/Modal/NotificationModal';
import { NotificationState } from '@/app/types';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Tambah state untuk mengontrol buka/tutup sidebar di mobile
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const router = useRouter();

  const handleLogout = () => {
    setNotification({
      isOpen: true,
      title: 'Konfirmasi Logout',
      message: 'Anda yakin ingin keluar dari sesi ini?',
      type: 'confirm',
      onConfirm: performLogout,
    });
  };

   const performLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admindashboard'); // Arahkan ke halaman login admin
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="h-16 bg-red-600 shadow-lg flex-shrink-0 flex items-center justify-between px-4 sm:px-6 z-20">
        <div className="flex items-center gap-3">
          {/* 2. Tombol Hamburger, hanya muncul di mobile (disembunyikan di ukuran md ke atas) */}
          <button 
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 text-white"
            aria-label="Buka menu"
          >
            <FiMenu size={24} />
          </button>

          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <Image src="/logobsg.jpg" width={38} height={38} alt="Logo" className="rounded-full"/>
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide">Admin Panel</h1>
        </div>
         <button 
          onClick={handleLogout}
          className="p-2 text-white rounded-full hover:bg-red-700"
          title="Logout"
        >
          <FiLogOut size={22} />
        </button>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* 3. Kirim state dan fungsi ke komponen Sidebar */}
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto bg-gray-100">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
      {notification && (
        <NotificationModal
          onClose={() => setNotification(null)}
          {...notification}
        />
      )}
    </div>
  );
}