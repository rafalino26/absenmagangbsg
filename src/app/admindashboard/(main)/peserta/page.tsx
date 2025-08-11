// app/admindashboard/(main)/peserta/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiPlus } from 'react-icons/fi';
import SpinnerOverlay from '@/app/components/loading/SpinnerOverlay';
import NotificationModal from '@/app/components/Modal/NotificationModal';
import AddInternModal from '@/app/components/Modal/AddInternModal';
import EditInternModal from '@/app/components/Modal/EditInternModal';
import ThreeDotMenu from '@/app/components/ThreeDotMenu';
import { NotificationState } from '@/app/types';
import { format } from 'date-fns';

// Tipe data untuk peserta magang, sesuai dengan apa yang dikirim oleh API
interface Intern {
  id: number;
  internCode: string | null;
  name: string;
  division: string;
  isActive: boolean;
  periodStartDate: string | null;
  periodEndDate: string | null;
  mentor: {
    id: number;
    name: string;
  } | null;
}

export default function ManageInternsPage() {
  const [interns, setInterns] = useState<Intern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  
  // State untuk mengontrol modal
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState<Intern | null>(null);

  // Fungsi untuk mengambil data peserta dari API
  const fetchInterns = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/manage-interns');
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Gagal mengambil data peserta.');
      }
      setInterns(await response.json());
    } catch (error: any) {
      setNotification({ isOpen: true, title: 'Error', message: error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterns();
  }, [fetchInterns]);

  // Handler untuk membuka modal edit
  const handleOpenEditModal = (intern: Intern) => {
    setSelectedIntern(intern);
    setEditModalOpen(true);
  };

  // Handler untuk konfirmasi arsip
  const handleArchiveConfirm = (intern: Intern) => {
    setNotification({
      isOpen: true,
      title: 'Arsipkan Peserta?',
      message: `Anda yakin ingin mengarsipkan ${intern.name}? Mereka akan dipindahkan ke halaman Arsip Magang.`,
      type: 'confirm',
      onConfirm: () => performArchive(intern.id),
    });
  };

  // Fungsi untuk menjalankan proses arsip
  const performArchive = async (id: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/manage-interns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: false }), // Kirim data untuk mengarsip
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Gagal mengarsipkan peserta.');
      }

      setNotification({ isOpen: true, title: 'Berhasil', message: 'Peserta berhasil diarsipkan.', type: 'success' });
      fetchInterns(); // Refresh data
    } catch (error: any) {
      setNotification({ isOpen: true, title: 'Gagal', message: error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <SpinnerOverlay />}
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Kelola Peserta Magang</h1>
        <p className="mt-1 text-md text-gray-600">Tambah, edit, dan arsipkan data peserta magang.</p>
        <button
          onClick={() => setAddModalOpen(true)}
          className="mt-4 bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 flex items-center gap-2"
        >
          <FiPlus /> Tambah Peserta Baru
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <table className="min-w-full divide-y divide-gray-200">
         <thead className="bg-gray-50">
          <tr>
            {/* Kolom Nama dibuat lebih lebar */}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Nama</th>
            
            {/* Kolom lain diberi lebar yang lebih kecil */}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">Divisi</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">Mentor</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">Aksi</th>
          </tr>
        </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {interns.length > 0 ? (
              interns.map((intern) => {
                const actions = [
                  { label: 'Edit', onClick: () => handleOpenEditModal(intern) },
                  { label: 'Arsipkan', onClick: () => handleArchiveConfirm(intern), className: 'text-orange-600 hover:bg-orange-50' },
                ];

                return (
                  <tr key={intern.id}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{intern.name}</div>
                      <div className="text-sm text-gray-500">
                        Kode: {intern.internCode}| Periode: {intern.periodStartDate && intern.periodEndDate ? `${format(new Date(intern.periodStartDate), 'd LLL yy')} - ${format(new Date(intern.periodEndDate), 'd LLL yy')}` : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{intern.division}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{intern.mentor?.name || '-'}</td>
                    <td className="px-6 py-4 text-center relative">
                      <ThreeDotMenu actions={actions} />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="text-center p-8 text-gray-500">
                  {isLoading ? 'Memuat data...' : 'Belum ada data peserta.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AddInternModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={fetchInterns}
        setNotification={setNotification}
      />
      
      <EditInternModal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSuccess={fetchInterns}
        internData={selectedIntern}
        setNotification={setNotification}
      />

      {notification && (
        <NotificationModal
          onClose={() => setNotification(null)}
          {...notification}
        />
      )}
    </>
  );
}