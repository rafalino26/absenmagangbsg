'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { FiPlus } from 'react-icons/fi';
import SpinnerOverlay from '@/app/components/loading/SpinnerOverlay';
import NotificationModal from '@/app/components/Modal/NotificationModal';
import AddMentorModal from '@/app/components/Modal/AddMentorModal';
import EditMentorModal from '@/app/components/Modal/EditMentorModal'; // Impor modal edit
import ThreeDotMenu from '@/app/components/ThreeDotMenu'; // Impor menu titik tiga
import { NotificationState } from '@/app/types';
import { Role } from '@prisma/client'; 

interface User {
  id: number;
  name: string;
  role: Role;
  division: { // <-- Diubah menjadi objek
    id: number;
    name: string;
  } | null;
}

export default function ManageMentorsPage() {
  const [users, setUsers] = useState<User[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  
  // State untuk kontrol modal
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/mentors');
      if (response.ok) {
        setUsers(await response.json());
      } else {
        throw new Error('Gagal mengambil data. Pastikan Anda login sebagai Superadmin.');
      }
    } catch (error: any) {
      setNotification({ isOpen: true, title: 'Error', message: error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  // Handler untuk membuka modal edit
  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  // Handler untuk konfirmasi hapus
  const handleDeleteConfirm = (user: User) => {
    const userType = user.role === 'ADMIN' ? 'Mentor' : 'Dosen';
    setNotification({
      isOpen: true,
      title: `Hapus ${userType}?`,
      message: `Anda yakin ingin menghapus ${user.name}?`,
      type: 'confirm',
      onConfirm: () => performDelete(user.id),
    });
  };

  const performDelete = async (id: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/mentors/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Gagal menghapus mentor.');
      }

      setNotification({ isOpen: true, title: 'Berhasil', message: 'Mentor berhasil dihapus.', type: 'success' });
      fetchUsers(); // Refresh data
    } catch (error: any) {
      setNotification({ isOpen: true, title: 'Gagal', message: error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

 const filteredUsers = useMemo(() => {
  if (!searchQuery) return users;
  const lowercasedQuery = searchQuery.toLowerCase();
  return users.filter(user =>
    user.name.toLowerCase().includes(lowercasedQuery) ||
    (user.division && user.division.name.toLowerCase().includes(lowercasedQuery))
  );
}, [users, searchQuery]);


  return (
    <>
      {isLoading && <SpinnerOverlay />}
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Kelola Akun Mentor & Dosen</h1>
        <p className="mt-1 text-md text-gray-600">Tambah, lihat, atau hapus akun untuk mentor.</p>
        <button
          onClick={() => setAddModalOpen(true)}
          className="mt-4 bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 flex items-center gap-2"
        >
          <FiPlus /> Tambah Mentor Baru
        </button>
      </div>
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari berdasarkan nama atau divisi..."
          className="w-full md:w-1/3 p-2 border border-gray-300 rounded-md text-black"
        />
      </div>
      <div className="bg-white rounded-lg shadow-sm border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Divisi/Universitas</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
          {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                const actions = [
                  { label: 'Edit', onClick: () => handleOpenEditModal(user) },
                  { label: 'Hapus', onClick: () => handleDeleteConfirm(user), className: 'text-red-600 hover:bg-red-50' },
                ];
                return (
                  <tr key={user.id}>
                    <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{user.division?.name || '-'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-indigo-100 text-indigo-800'}`}>
                        {user.role === 'ADMIN' ? 'Mentor' : 'Dosen'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center relative">
                      <ThreeDotMenu actions={actions} />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={3} className="text-center p-8 text-gray-500">
                  {isLoading ? 'Memuat data...' : 'Belum ada data mentor.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AddMentorModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={fetchUsers}
        setNotification={setNotification}
      />
      
      <EditMentorModal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSuccess={fetchUsers}
        mentorData={selectedUser}
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