// app/components/Modal/EditMentorModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { FiX, FiEye, FiEyeOff } from 'react-icons/fi';
import { NotificationState } from '@/app/types';

interface Mentor {
  id: number;
  name: string;
  division: string;
}

interface EditMentorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mentorData: Mentor | null;
  setNotification: (notification: NotificationState | null) => void;
}

export default function EditMentorModal({ isOpen, onClose, onSuccess, mentorData, setNotification }: EditMentorModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [name, setName] = useState('');
  const [division, setDivision] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (mentorData) {
      setName(mentorData.name);
      setDivision(mentorData.division);
      setPassword(''); // Kosongkan password setiap modal dibuka
      setShowPassword(false);
    }
  }, [mentorData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorData) return;

    setIsSubmitting(true);
    try {
      const dataToUpdate: any = { name, division };
      if (password) {
        dataToUpdate.password = password;
      }

      const response = await fetch(`/api/admin/mentors/${mentorData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToUpdate),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Gagal menyimpan perubahan.');
      }

      setNotification({ isOpen: true, title: 'Berhasil', message: 'Data mentor berhasil diperbarui.', type: 'success' });
      onSuccess();
      onClose();
    } catch (error: any) {
      setNotification({ isOpen: true, title: 'Gagal', message: error.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-40">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">Edit Mentor</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FiX size={24}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 text-black">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Divisi</label>
              <input type="text" value={division} onChange={(e) => setDivision(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password Baru (Opsional)</label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Kosongkan jika tidak diubah"
                  className="block w-full border border-gray-300 rounded-md shadow-sm p-2 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <button type="submit" disabled={isSubmitting} className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400">
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}