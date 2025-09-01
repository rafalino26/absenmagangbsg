'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { FiPlus } from 'react-icons/fi';
import SpinnerOverlay from '@/app/components/loading/SpinnerOverlay';
import NotificationModal from '@/app/components/Modal/NotificationModal';
import AddMentorModal from '@/app/components/Modal/AddMentorModal';
import EditMentorModal from '@/app/components/Modal/EditMentorModal';
import ThreeDotMenu from '@/app/components/ThreeDotMenu';
import { NotificationState } from '@/app/types';
import { Role } from '@prisma/client'; 

// 1. Tipe data User diperbarui
interface User {
  id: number;
  name: string;
  role: Role;
  division: { id: number; name: string; } | null;
  university: { id: number; name: string; } | null;
}

export default function ManageMentorsPage() {
  const [users, setUsers] = useState<User[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      // Endpoint ini sekarang sudah benar karena API-nya sudah kita modifikasi
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
  
  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

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
    // URL diperbaiki dengan menambahkan /${id} di akhir
    const response = await fetch(`/api/admin/mentors/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      // Jika respons tidak OK, coba baca sebagai JSON. Jika gagal, beri pesan umum.
      try {
        const result = await response.json();
        throw new Error(result.error || 'Gagal menghapus akun.');
      } catch (jsonError) {
        throw new Error('Gagal menghapus akun.');
      }
    }
    
    // Cek jika respons memiliki body sebelum mencoba .json()
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
       const result = await response.json();
       setNotification({ isOpen: true, title: 'Berhasil', message: result.message || 'Akun berhasil dihapus.', type: 'success' });
    } else {
       setNotification({ isOpen: true, title: 'Berhasil', message: 'Akun berhasil dihapus.', type: 'success' });
    }

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
    
    // 2. Logika pencarian diperbarui
    return users.filter(user => {
      const affiliationName = (user.role === Role.ADMIN ? user.division?.name : user.university?.name) || '';
      return (
        user.name.toLowerCase().includes(lowercasedQuery) ||
        affiliationName.toLowerCase().includes(lowercasedQuery)
      );
    });
  }, [users, searchQuery]);

  return (
    <>
      {isLoading && <SpinnerOverlay />}
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Kelola Akun Mentor & Dosen</h1>
        <p className="mt-1 text-md text-gray-600">Tambah, lihat, atau hapus akun untuk mentor dan dosen.</p>
        <button
          onClick={() => setAddModalOpen(true)}
          className="mt-4 bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 flex items-center gap-2"
        >
          <FiPlus /> Tambah Akun Baru
        </button>
      </div>
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari berdasarkan nama atau divisi/universitas..."
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
                  
                  {/* 3. Tampilan tabel diperbarui */}
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.role === Role.ADMIN ? (user.division?.name || '-') : (user.university?.name || '-')}
                  </td>
                  
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
              <td colSpan={4} className="text-center p-8 text-gray-500">
                {isLoading ? 'Memuat data...' : 'Belum ada data.'}
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