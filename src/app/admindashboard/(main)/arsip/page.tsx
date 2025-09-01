'use client';

import { useState, useEffect, useCallback, useMemo } from 'react'; // PERBAIKAN: Impor useMemo
import { FiRotateCcw, FiTrash2 } from 'react-icons/fi';
import { InternSummary } from '@/app/types';
import AdminDashboardSkeleton from '@/app/components/loading/AdminDashboardSkeleton';
import { NotificationState } from '@/app/types';
import { format } from 'date-fns';
import NotificationModal from '@/app/components/Modal/NotificationModal';
import SpinnerOverlay from '@/app/components/loading/SpinnerOverlay';

export default function ArchivePage() {
  const [allArchivedInterns, setAllArchivedInterns] = useState<InternSummary[]>([]); // Ganti nama state
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [searchQuery, setSearchQuery] = useState(''); // PERBAIKAN: Tambah state untuk search bar

  const fetchArchivedInterns = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/interns/archive'); // Pastikan path ini benar
      if (response.ok) {
        setAllArchivedInterns(await response.json());
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

  // PERBAIKAN: Logika untuk memfilter data berdasarkan pencarian
  const filteredInterns = useMemo(() => {
    if (!searchQuery) {
      return allArchivedInterns;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return allArchivedInterns.filter(intern =>
      intern.name.toLowerCase().includes(lowercasedQuery) ||
      intern.internCode?.toLowerCase().includes(lowercasedQuery) ||
      (intern.division?.name.toLowerCase().includes(lowercasedQuery)) ||
      (intern.university?.name.toLowerCase().includes(lowercasedQuery))
    );
  }, [allArchivedInterns, searchQuery]);

  // ... (fungsi handleRestore, performRestore, handlePermanentDelete, performPermanentDelete tidak berubah)
  const handleRestore = (id: number, name: string) => {
    setNotification({
      isOpen: true,
      title: 'Kembalikan Peserta?',
      message: `Anda yakin ingin mengembalikan ${name} ke daftar peserta aktif?`,
      type: 'confirm',
      onConfirm: () => performRestore(id),
    });
  };

  const performRestore = async (id: number) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/interns/manage?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore' }),
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Gagal me-restore peserta.');
      }
      
      setNotification({ isOpen: true, title: 'Berhasil', message: 'Peserta telah berhasil dikembalikan ke daftar aktif.', type: 'success' });
      fetchArchivedInterns();
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
      message: `PERINGATAN: Anda akan menghapus permanen data ${intern.name}. Aksi ini tidak bisa dibatalkan.`,
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
        
        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, kode, divisi, atau universitas..."
            className="w-full md:w-1/3 p-2 border border-gray-300 rounded-md text-black"
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Peserta</th>
                {/* PERBAIKAN: Tambahkan kolom baru */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Divisi & Universitas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Periode Magang</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* PERBAIKAN: Gunakan 'filteredInterns' untuk me-render data */}
              {filteredInterns.length > 0 ? (
                filteredInterns.map((intern) => (
                  <tr key={intern.id}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{intern.name}</div>
                      <div className="text-sm text-gray-500">Kode: {intern.internCode || '-'}</div>
                    </td>
                    {/* PERBAIKAN: Tampilkan Divisi dan Universitas */}
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div><span className="font-semibold">Div:</span> {intern.division?.name || '-'}</div>
                      <div><span className="font-semibold">Univ:</span> {intern.university?.name || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(intern.periodStartDate && intern.periodEndDate)
                        ? `${format(new Date(intern.periodStartDate), 'd LLL yy')} - ${format(new Date(intern.periodEndDate), 'd LLL yy')}`
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center gap-4">
                        <button onClick={() => handleRestore(intern.id, intern.name)} className="text-green-600 hover:text-green-900" title="Restore">
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
                // PERBAIKAN: Update colspan
                <tr><td colSpan={4} className="text-center p-8 text-gray-500">
                  {searchQuery ? 'Tidak ada hasil ditemukan.' : 'Arsip kosong.'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {notification && (
        <NotificationModal
          onClose={() => setNotification(null)}
          {...notification}
        />
      )}
    </>
  );
}