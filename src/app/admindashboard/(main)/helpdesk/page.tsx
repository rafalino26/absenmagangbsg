'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiEye, FiTrash2 } from 'react-icons/fi';
import HelpdeskDetailModal from '@/app/components/Modal/HelpdeskDetailModal';
import NotificationModal from '@/app/components/Modal/NotificationModal';
import SpinnerOverlay from '@/app/components/loading/SpinnerOverlay';
import { NotificationState } from '@/app/types';
import AdminDashboardSkeleton from '@/app/components/loading/AdminDashboardSkeleton';

// Definisikan tipe data untuk tiket agar lebih aman
interface HelpdeskTicket {
  id: number;
  user: { name: string };
  createdAt: string;
  status: string;
  description: string;
  proofUrl?: string | null;
}

export default function HelpdeskPage() {
  const [tickets, setTickets] = useState<HelpdeskTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // Untuk loading aksi hapus
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<HelpdeskTicket | null>(null);
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/helpdesk');
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      }
    } catch (error) {
      console.error("Gagal mengambil data helpdesk:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // 2. Buat fungsi untuk membuka modal
  const handleViewTicket = (ticket: HelpdeskTicket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

   const handleDeleteConfirm = (ticket: HelpdeskTicket) => {
    setNotification({
      isOpen: true,
      title: 'Hapus Laporan?',
      message: `Anda yakin ingin menghapus permanen laporan dari ${ticket.user.name}? Aksi ini tidak bisa dibatalkan.`,
      type: 'confirm',
      onConfirm: () => performPermanentDelete(ticket.id),
    });
  };

    // Fungsi untuk menjalankan proses hapus ke backend
  const performPermanentDelete = async (id: number) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/helpdesk/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Gagal menghapus laporan.');
      
      setNotification({ isOpen: true, title: 'Berhasil', message: 'Laporan telah dihapus permanen.', type: 'success' });
      fetchTickets(); // Refresh daftar setelah berhasil
    } catch (error: any) {
      setNotification({ isOpen: true, title: 'Gagal', message: error.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

     if (isLoading) {
      return <AdminDashboardSkeleton />;
    }


  return (
    <>
      {isSubmitting && <SpinnerOverlay />}
      
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Helpdesk</h1>
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="min-w-full text-black divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium">Pelapor</th>
                <th className="px-6 py-3 text-left text-xs font-medium">Tanggal</th>
                <th className="px-6 py-3 text-center text-xs font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={3} className="text-center p-8">Memuat laporan...</td></tr>
              ) : tickets.length > 0 ? (
                tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="px-6 py-4 font-medium">{ticket.user.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(ticket.createdAt).toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center gap-4">
                        <button onClick={() => handleViewTicket(ticket)} className="text-indigo-600 hover:text-indigo-900" title="Lihat Laporan">
                          <FiEye />
                        </button>
                        <button onClick={() => handleDeleteConfirm(ticket)} className="text-red-600 hover:text-red-900" title="Hapus Permanen">
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={3} className="text-center p-8">Tidak ada laporan masuk.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* 4. Render modal dengan state yang benar */}
      <HelpdeskDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ticket={selectedTicket}
      />
      {/* Hanya render modal jika 'notification' ada isinya */}
    {notification && (
    <NotificationModal
        onClose={() => setNotification(null)}
        {...notification}
    />
    )}
    </>
  );
}