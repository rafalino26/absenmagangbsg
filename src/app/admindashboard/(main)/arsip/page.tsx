'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiRotateCcw, FiTrash2 } from 'react-icons/fi';
import { InternSummary } from '@/app/types';
import AdminDashboardSkeleton from '@/app/components/loading/AdminDashboardSkeleton';
import { NotificationState } from '@/app/types';
import { format } from 'date-fns';
import NotificationModal from '@/app/components/Modal/NotificationModal';
import SpinnerOverlay from '@/app/components/loading/SpinnerOverlay';

export default function ArchivePage() {
  const [archivedInterns, setArchivedInterns] = useState<InternSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const fetchArchivedInterns = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/interns/archived');
      if (response.ok) {
        setArchivedInterns(await response.json());
      }
    } catch (error) {
      console.error("Gagal mengambil arsip:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArchivedInterns();
  }, [fetchArchivedInterns]);

 const handleRestore = async (id: number) => {
    if (!confirm("Anda yakin ingin mengembalikan peserta ini ke daftar aktif?")) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/interns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore' }),
      });
      if (!response.ok) throw new Error('Gagal me-restore peserta.');
      
      setNotification({ isOpen: true, title: 'Berhasil', message: 'Peserta telah berhasil dikembalikan ke daftar aktif.', type: 'success' });
      fetchArchivedInterns(); // Refresh daftar arsip
    } catch (error: any) {
      setNotification({ isOpen: true, title: 'Gagal', message: error.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

    const handlePermanentDelete = (intern: InternSummary) => {
    setNotification({
      isOpen: true,
      title: 'Hapus Permanen?',
      message: `PERINGATAN: Anda akan menghapus permanen data ${intern.name} dan seluruh riwayat absennya. Aksi ini tidak bisa dibatalkan.`,
      type: 'confirm',
      onConfirm: () => performPermanentDelete(intern.id),
    });
  };

 const performPermanentDelete = async (id: number) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/interns/manage?id=${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Gagal menghapus permanen.');

      setNotification({ isOpen: true, title: 'Berhasil', message: 'Data peserta telah dihapus permanen.', type: 'success' });
      fetchArchivedInterns();
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Arsip Peserta Magang</h1>
        <p className="mt-1 text-md text-gray-600">Daftar peserta yang telah menyelesaikan periode magang atau dinonaktifkan.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Peserta</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Periode Magang</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {archivedInterns.length > 0 ? (
                archivedInterns.map((intern) => (
                  <tr key={intern.id}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{intern.name}</div>
                    <div className="text-sm text-gray-500">Kode: {String(intern.id).padStart(3, '0')} | {intern.division}</div>
                  </td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(intern.periodStartDate && intern.periodEndDate)
                        ? `${format(new Date(intern.periodStartDate), 'd LLL yy')} - ${format(new Date(intern.periodEndDate), 'd LLL yy')}`
                        : '-'}
                    </td>
                 <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center gap-4">
                        <button onClick={() => handleRestore(intern.id)} className="text-green-600 hover:text-green-900" title="Restore">
                          <FiRotateCcw />
                        </button>
                        <button onClick={() => handlePermanentDelete(intern)} className="text-red-600 hover:text-red-900" title="Hapus Permanen">
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={3} className="text-center p-8">Arsip kosong.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
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